// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import Folders from './collections/Folders'
import getPhotos from './endpoints/getPhotos'
import Orders from './collections/Orders'
import Products from './collections/Products'
import Directories from './collections/Directories'
import createArchive from './endpoints/createArchive'
import { FunctionalMode } from './FunctionalMode/config'
import monitorFolders from './endpoints/monitoringFolders'
import dynamicThumbnail from './endpoints/dynamicThumbnail'
import { PeriodCleaner } from './PeriodCleaner'
import processCleanerEndpoint from './endpoints/processCleaner'
import Formats from './collections/Formats'
import { PeriodMonitoring } from './PeriodMonitoring'
import { OrderCreationMode } from './OrderCreationMode'



const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 15.
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  collections: [Pages, Posts, Media, Categories, Users, Folders, Orders, Products, Directories, Formats],
  cors: ['http://localhost:3000', 'http://network:3000'],
  csrf: ['http://localhost:3000', 'http://network:3000'],
  endpoints: [getPhotos, createArchive, monitorFolders, dynamicThumbnail, processCleanerEndpoint],
  globals: [Header, Footer, FunctionalMode, PeriodCleaner, PeriodMonitoring, OrderCreationMode],
  plugins: [
    ...plugins,
    // storage-adapter-placeholder
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
