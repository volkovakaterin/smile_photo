export type ImagesType = { image: string; products: { product: string; quantity: number; label: string }[]; }

export type BasketProduct = {
    product: string;
    photos: { image: string; quantity: number }[];
};

export function basketProductsFn(images: ImagesType[]): BasketProduct[] {
    const result = images.flatMap(order =>
        order.products.map(product => ({
            product: product.label,
            photos: [
                {
                    image: order.image,
                    quantity: product.quantity
                }
            ]
        }))
    ).reduce<BasketProduct[]>((acc, curr) => {
        const existing = acc.find(item => item.product === curr.product);
        if (existing) {
            existing.photos.push(...curr.photos);
        } else {
            acc.push(curr);
        }
        return acc;
    }, []);
    return result
}