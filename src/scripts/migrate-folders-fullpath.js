import 'dotenv/config'
import { MongoClient } from 'mongodb'
import fs from 'fs'

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`
  fs.appendFileSync('./migration.log', line)
  console.log(message)
}

const uri = process.env.DATABASE_URI
if (!uri) {
  console.error('DATABASE_URI is not set (e.g. mongodb://127.0.0.1/photo-new)')
  process.exit(1)
}

function normalizePath(p) {
  if (p == null) return ''
  return String(p).replaceAll('\\', '/').trim().replace(/\/+$/g, '')
}

function buildFullPath(doc) {
  const name = normalizePath(doc?.name ?? '')
  const path = normalizePath(doc?.path ?? '')
  if (!path) return name
  if (!name) return path
  return `${path}/${name}`
}

async function hasUniqueIndex(coll) {
  const idx = await coll.indexes()
  return idx.some((i) => i.key?.fullPath === 1 && i.unique === true)
}

async function main() {
  const client = new MongoClient(uri)
  await client.connect()

  const db = client.db() // из URI (/photo-new)
  const coll = db.collection('folders')

  // 0) Если unique уже есть — выходим (ничего не делаем)
  if (await hasUniqueIndex(coll)) {
    log('Unique index on folders.fullPath already exists. Nothing to do.')
    await client.close()
    return
  }

  log('Migrating folders.fullPath ...')

  // 1) Заполнить fullPath где null/пусто
  const cursor = coll.find(
    {
      $or: [{ fullPath: null }, { fullPath: '' }, { fullPath: { $exists: false } }],
    },
    { projection: { _id: 1, path: 1, name: 1 } },
  )

  let filled = 0
  while (await cursor.hasNext()) {
    const doc = await cursor.next()
    const fullPath = buildFullPath(doc)
    await coll.updateOne({ _id: doc._id }, { $set: { fullPath } })
    filled++
  }
  log(`Filled fullPath for: ${filled}`)

  // 2) Удалить дубликаты по fullPath (оставить самый ранний)
  const dups = await coll
    .aggregate([
      { $match: { fullPath: { $type: 'string', $ne: '' } } },
      { $group: { _id: '$fullPath', ids: { $push: '$_id' }, c: { $sum: 1 } } },
      { $match: { c: { $gt: 1 } } },
    ])
    .toArray()

  let deleted = 0
  for (const d of dups) {
    const idsToDelete = d.ids.slice(1)
    const res = await coll.deleteMany({ _id: { $in: idsToDelete } })
    deleted += res.deletedCount
  }
  log(`Deleted duplicate docs: ${deleted}`)

  // 3) Создать unique индекс
  await coll.createIndex({ fullPath: 1 }, { unique: true, background: true })
  log('Created unique index folders.fullPath')

  await client.close()
  log('Migration applied successfully. System protected from folder duplication.')
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
