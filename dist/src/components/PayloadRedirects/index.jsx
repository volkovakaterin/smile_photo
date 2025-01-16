import { getCachedDocument } from '@/utilities/getDocument';
import { getCachedRedirects } from '@/utilities/getRedirects';
import { notFound, redirect } from 'next/navigation';
/* This component helps us with SSR based dynamic redirects */
export const PayloadRedirects = async ({ disableNotFound, url }) => {
    const slug = url.startsWith('/') ? url : `${url}`;
    const redirects = await getCachedRedirects()();
    const redirectItem = redirects.find((redirect) => redirect.from === slug);
    if (redirectItem) {
        if (redirectItem.to?.url) {
            redirect(redirectItem.to.url);
        }
        let redirectUrl;
        if (typeof redirectItem.to?.reference?.value === 'string') {
            const collection = redirectItem.to?.reference?.relationTo;
            const id = redirectItem.to?.reference?.value;
            const document = (await getCachedDocument(collection, id)());
            redirectUrl = `${redirectItem.to?.reference?.relationTo !== 'pages' ? `/${redirectItem.to?.reference?.relationTo}` : ''}/${document?.slug}`;
        }
        else {
            redirectUrl = `${redirectItem.to?.reference?.relationTo !== 'pages' ? `/${redirectItem.to?.reference?.relationTo}` : ''}/${typeof redirectItem.to?.reference?.value === 'object'
                ? redirectItem.to?.reference?.value?.slug
                : ''}`;
        }
        if (redirectUrl)
            redirect(redirectUrl);
    }
    if (disableNotFound)
        return null;
    notFound();
};
//# sourceMappingURL=index.jsx.map