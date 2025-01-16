'use client';
import React, { useState, useEffect } from 'react';
import styles from './ProductBasket.module.scss';
import { PhotoCard } from '../PhotoCard/PhotoCard';
const ProductBasket = ({ toggleSelect, checkSelectPhoto, selectPhotos, product, onOpen, dir, openPreviewModal, images, mode }) => {
    const [cards, setCards] = useState([]);
    useEffect(() => {
        if (mode == 'with_formats' && product) {
            setCards(product.photos);
        }
        else if (images) {
            setCards(images);
        }
    }, [images, product]);
    return (<div className={styles.ProductBasket}>
            {product && <span className={styles.title}>{product.product}</span>}
            <div className={styles.wrapperPhoto}>
                {cards.map((image, index) => (<PhotoCard key={index} fromBasket={true} image={image.image} quantity={image.quantity} index={index} toggleSelect={toggleSelect} checkSelectPhoto={checkSelectPhoto} selectPhotos={selectPhotos} onOpen={onOpen ? () => onOpen(image) : undefined} openPreviewModal={openPreviewModal} dir={dir}></PhotoCard>))}
            </div>
        </div>);
};
export default ProductBasket;
//# sourceMappingURL=ProductBasket.jsx.map