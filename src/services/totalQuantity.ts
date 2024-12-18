import { BasketProduct } from "./basketProducts";


export function totalQuantityFn(products: BasketProduct[]): number {
    const totalQuantity = products.reduce((total, product) => {
        const productQuantity = product.photos.reduce((sum, photo) => sum + photo.quantity, 0);
        return total + productQuantity;
    }, 0);
    return totalQuantity
}
