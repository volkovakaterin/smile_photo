
import type { Payload } from 'payload';

export async function bumpFoldersVersion(payload: Payload) {
    const current = await payload.findGlobal({ slug: 'folders-version', depth: 0 });
    const next = (current?.foldersVersion ?? 0) + 1;

    await payload.updateGlobal({
        slug: 'folders-version',
        data: { foldersVersion: next },
        overrideAccess: true, // критично: обходим access.update:false
    });
}
