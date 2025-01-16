import { revalidateTag } from 'next/cache';
export const revalidateHeader = ({ doc, req: { payload } }) => {
    payload.logger.info(`Revalidating header`);
    revalidateTag('global_header');
    return doc;
};
//# sourceMappingURL=revalidateHeader.js.map