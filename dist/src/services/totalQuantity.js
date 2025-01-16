export function totalQuantityFn(products) {
    const totalQuantity = products.reduce((total, product) => {
        const productQuantity = product.photos.reduce((sum, photo) => sum + photo.quantity, 0);
        return total + productQuantity;
    }, 0);
    return totalQuantity;
}
//# sourceMappingURL=totalQuantity.js.map