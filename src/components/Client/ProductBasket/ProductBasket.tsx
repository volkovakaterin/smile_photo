'use client'
import React, { useState, useEffect } from 'react';
import styles from './ProductBasket.module.scss';
import { PhotoCard } from '../PhotoCard/PhotoCard';
import { ProductBasketType } from '@/app/(frontend)/basket/page';


interface ProductBasketProps {
    togglePrint?: (el: string, select: boolean) => void;
    toggleSelect: (element: string, select: boolean) => void;
    checkSelectPhoto: (element: any) => boolean;
    selectPhotos: string[];
    product?: ProductBasketType;
    onOpen?: (photoProduct: { image: string, quantity: number }) => void;
    dir: string
    openPreviewModal?: (image: string) => void;
    images?: { image: string; quantity: number }[];
    mode: string;
}


const ProductBasket = ({ toggleSelect, checkSelectPhoto, selectPhotos, product, onOpen, dir,
    openPreviewModal, images, mode, togglePrint }: ProductBasketProps) => {
    const [cards, setCards] = useState<{ image: string }[] | { image: string; quantity: number }[]>([]);

    useEffect(() => {
        if (mode == 'with_formats' && product) {
            setCards(product.photos)
        } else if (images) { setCards(images) }
    },
        [images, product])

    return (
        <div className={styles.ProductBasket}>
            {product && <span className={styles.title}>{product.product}</span>}
            <div className={styles.wrapperPhoto}>
                {cards.map((image, index) => (
                    <PhotoCard key={index} fromBasket={true} image={image.image}
                        printFromBasket={image.print}
                        quantity={image.quantity}
                        index={index} toggleSelect={toggleSelect}
                        togglePrint={togglePrint}
                        checkSelectPhoto={checkSelectPhoto}
                        checkPrintPhoto={() => { return false; }}
                        selectPhotos={selectPhotos}
                        onOpen={onOpen ? () => onOpen(image) : undefined}
                        openPreviewModal={openPreviewModal}
                        dir={dir}></PhotoCard>))}
            </div>
        </div>
    );
};

export default ProductBasket;
