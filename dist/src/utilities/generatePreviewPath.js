const collectionPrefixMap = {
    posts: '/posts',
    pages: '',
};
export const generatePreviewPath = ({ collection, slug }) => {
    const path = `${collectionPrefixMap[collection]}/${slug}`;
    const params = {
        slug,
        collection,
        path,
    };
    const encodedParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        encodedParams.append(key, value);
    });
    return `/next/preview?${encodedParams.toString()}`;
};
//# sourceMappingURL=generatePreviewPath.js.map