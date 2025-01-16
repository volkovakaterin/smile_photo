export function basketProductsFn(images) {
    const result = images.flatMap(order => order.products.map(product => ({
        product: product.label,
        photos: [
            {
                image: order.image,
                quantity: product.quantity
            }
        ]
    }))).reduce((acc, curr) => {
        const existing = acc.find(item => item.product === curr.product);
        if (existing) {
            existing.photos.push(...curr.photos);
        }
        else {
            acc.push(curr);
        }
        return acc;
    }, []);
    return result;
}
//# sourceMappingURL=basketProducts.js.map