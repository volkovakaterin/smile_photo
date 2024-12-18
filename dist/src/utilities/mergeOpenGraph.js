import { getServerSideURL } from './getURL';
const defaultOpenGraph = {
    type: 'website',
    description: 'An open-source website built with Payload and Next.js.',
    images: [
        {
            url: `${getServerSideURL()}/website-template-OG.webp`,
        },
    ],
    siteName: 'Payload Website Template',
    title: 'Payload Website Template',
};
export const mergeOpenGraph = (og) => {
    return {
        ...defaultOpenGraph,
        ...og,
        images: og?.images ? og.images : defaultOpenGraph.images,
    };
};
//# sourceMappingURL=mergeOpenGraph.js.map