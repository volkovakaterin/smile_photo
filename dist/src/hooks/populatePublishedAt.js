export const populatePublishedAt = ({ data, operation, req }) => {
    if (operation === 'create' || operation === 'update') {
        if (req.data && !req.data.publishedAt) {
            const now = new Date();
            return {
                ...data,
                publishedAt: now,
            };
        }
    }
    return data;
};
//# sourceMappingURL=populatePublishedAt.js.map