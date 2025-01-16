const format = (val) => val
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
    .toLowerCase();
const formatSlug = (fallback) => ({ data, operation, originalDoc, value }) => {
    if (typeof value === 'string') {
        return format(value);
    }
    if (operation === 'create') {
        const fallbackData = data?.[fallback] || originalDoc?.[fallback];
        if (fallbackData && typeof fallbackData === 'string') {
            return format(fallbackData);
        }
    }
    return value;
};
export default formatSlug;
//# sourceMappingURL=formatSlug.js.map