import { revalidateTag } from 'next/cache';
export const revalidateFooter = ({ doc, req: { payload } }) => {
    payload.logger.info(`Revalidating footer`);
    revalidateTag('global_footer');
    return doc;
};
//# sourceMappingURL=revalidateFooter.js.map