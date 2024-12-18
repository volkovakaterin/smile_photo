'use client'
import React, { useState, useEffect } from 'react';
import styles from './ProductBasket.module.scss';
import { PhotoCard } from '../PhotoCard/PhotoCard';
import { ProductBasketType } from '@/app/(frontend)/basket/page';


interface ProductBasketProps {
    images: string[];
    toggleSelect: (element: string, select: boolean) => void;
    checkSelectPhoto: (element: any) => boolean;
    selectPhotos: string[];
    product: ProductBasketType;
    onOpen: (photoProduct: { image: string, quantity: number }) => void;
    dir: string
}


const ProductBasket = ({ toggleSelect, checkSelectPhoto, selectPhotos, product, onOpen, dir }: ProductBasketProps) => {


    return (
        <div className={styles.ProductBasket}>
            <span className={styles.title}>{product.product}</span>
            <div className={styles.wrapperPhoto}>
                {product.photos.map((image, index) => (
                    <PhotoCard key={index} fromBasket={true} image={image.image}
                        quantity={image.quantity}
                        index={index} toggleSelect={toggleSelect}
                        checkSelectPhoto={checkSelectPhoto}
                        selectPhotos={selectPhotos}
                        onOpen={() => onOpen(image)} dir={dir}></PhotoCard>))}
            </div>
        </div>
    );
};

export default ProductBasket;
