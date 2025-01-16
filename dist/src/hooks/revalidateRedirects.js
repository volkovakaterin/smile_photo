import { revalidateTag } from 'next/cache';
export const revalidateRedirects = ({ doc, req: { payload } }) => {
    payload.logger.info(`Revalidating redirects`);
    revalidateTag('redirects');
    return doc;
};
//# sourceMappingURL=revalidateRedirects.js.map