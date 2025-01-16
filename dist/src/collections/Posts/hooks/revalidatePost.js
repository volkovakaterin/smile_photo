import { revalidatePath } from 'next/cache';
export const revalidatePost = ({ doc, previousDoc, req: { payload }, }) => {
    if (doc._status === 'published') {
        const path = `/posts/${doc.slug}`;
        payload.logger.info(`Revalidating post at path: ${path}`);
        revalidatePath(path);
    }
    // If the post was previously published, we need to revalidate the old path
    if (previousDoc._status === 'published' && doc._status !== 'published') {
        const oldPath = `/posts/${previousDoc.slug}`;
        payload.logger.info(`Revalidating old post at path: ${oldPath}`);
        revalidatePath(oldPath);
    }
    return doc;
};
//# sourceMappingURL=revalidatePost.js.map