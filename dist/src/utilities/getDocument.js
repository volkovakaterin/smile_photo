import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { unstable_cache } from 'next/cache';
async function getDocument(collection, slug, depth = 0) {
    const payload = await getPayload({ config: configPromise });
    const page = await payload.find({
        collection,
        depth,
        where: {
            slug: {
                equals: slug,
            },
        },
    });
    return page.docs[0];
}
/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedDocument = (collection, slug) => unstable_cache(async () => getDocument(collection, slug), [collection, slug], {
    tags: [`${collection}_${slug}`],
});
//# sourceMappingURL=getDocument.js.map