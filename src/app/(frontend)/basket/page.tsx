'use client'
import React, { useState, useEffect } from 'react';
import styles from './style.module.scss';
import ProductBasket from '@/components/Client/ProductBasket/ProductBasket';
import { ButtonSecondary } from '@/components/Client/UI/ButtonSecondary/ButtonSecondary';
import { NavigationBar } from '@/components/Client/NavigationBar/NavigationBar';
import SuccessOrder from '@/components/Client/SuccessOrder/SuccessOrder';
import { useOrder } from '@/providers/OrderProvider';
import { useOrderId } from '@/hooks/Order/useOrderId';
import { useEditOrder } from '@/hooks/Order/useEditPhoto';
import { basketProductsFn } from '@/services/basketProducts';
import { totalQuantityFn } from '@/services/totalQuantity';
import { createPortal } from 'react-dom';
import { TheModal } from '@/components/Client/TheModal/TheModal';
import { useStatusChangeOrder } from '@/hooks/Order/useChangeStatusOrder';
import { SliderPhotoProductType } from '@/components/Client/SliderPhotoProductType/SliderPhotoProductType';
import { FormTypeProduct } from '@/components/Client/FormTypeProduct/FormTypeProduct';
import { useProducts } from '@/hooks/Products/useGetProducts';
import { PreviewPhoto } from '@/components/Client/PreviewPhoto/PreviewPhoto';
import { useFunctionalMode } from '@/providers/FunctionalMode';

export type ProductBasketType = { product: string; photos: { image: string; quantity: number; }[]; }

const Basket = () => {
    const [showModal, setShowModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [success, setSuccess] = useState(false);
    const { orderId, quantityProducts, basketProducts, setBasketProducts, setQuantityProducts, directories, handleSetFormatForAll, formatForAll } = useOrder();
    const { order } = useOrderId(orderId);
    const { handleDeleteProduct, editOrder, applyFormatAllPhotos, handleDeletePhoto } = useEditOrder();
    const { handleChangeStatusOrder } = useStatusChangeOrder();
    const [date, setDate] = useState<{ date: string, time: string }>({ date: "", time: "" });
    const [telNumber, setTelNumber] = useState('');
    const [activeSlideTypeProduct, setActiveSlideTypeProduct] = useState<number | null>(null);
    const [activeSlide, setActiveSlide] = useState<number | null>(null);
    const [selectPhoto, setSelectPhoto] = useState<string | null>(null);
    const [currentImageProducts, setCurrentImageProducts] = useState(null);
    const { products } = useProducts();
    const { mode } = useFunctionalMode();

    const confirmOrder = () => {
        setTelNumber(order.tel_number)
        handleChangeStatusOrder('created', orderId);
        setSuccess(true);
    }

    const selectFormatForAll = (id, value, format) => {
        handleSetFormatForAll(id, format);
        if (value) {
            applyFormatAllPhotos({ id, format }, orderId, order, selectPhoto)
        }
    }

    useEffect(() => {
        if (!order) { return }
        if (mode == 'with_formats') {
            const orderForBasket = basketProductsFn(order.images);
            setBasketProducts(orderForBasket);
            setQuantityProducts(totalQuantityFn(orderForBasket));
            const products = order.images.find((item) => item.image === selectPhoto);
            setCurrentImageProducts(products ? products.products : null);
        } else {
            setQuantityProducts(order.images.length)
        }
    }, [order])

    const toggleSelect = (element: string, product?) => {
        if (!orderId) {
            console.error('Заказ не открыт. Невозможно удалить фото.');
            return;
        }
        if (mode == 'with_formats') {
            handleDeleteProduct(element, orderId, order, product);
        } else { handleDeletePhoto(element, orderId, order) }
    }

    const handleOpenEdit = (photoProduct, product) => {
        const index = order.images.findIndex(item => item.image === photoProduct.image);
        setSelectPhoto(photoProduct.image);
        setCurrentImageProducts(order.images.find((item) => item.image === photoProduct.image).products || null);
        setActiveSlideTypeProduct(index);
        setShowModal(true)
    }

    const closeTypeProduct = () => {
        setShowModal(false);
        setSelectPhoto(null);
        setActiveSlideTypeProduct(null);
    }

    const handleClosePreviewModal = () => {
        setShowPreviewModal(false);
        setActiveSlide(null);
    }

    const handleOpenPreviewModal = (image) => {
        const index = order.images.findIndex(item => item.image === image);
        setShowPreviewModal(true);
        setActiveSlide(index);
    }

    useEffect(() => {
        if (!orderId) return;
        const date = new Date(order.createdAt);

        const formattedDate = date.toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });

        const formattedTime = date.toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
        });
        setDate({ date: formattedDate, time: formattedTime })
    }, [order, orderId])


    const switchSelectePhoto = (image) => {
        setSelectPhoto(image);
        const products = order.images.find((item) => item.image === image);
        setCurrentImageProducts(products ? products.products : null);
    }

    const addPhotoOrder = (productsWithPhoto) => {
        editOrder(productsWithPhoto, orderId, selectPhoto, order);
    }

    if (!order) return;
    return (
        <div>
            {!success && (<div>
                <NavigationBar basket={true} totalQuantity={quantityProducts} />
                <div className={styles.Basket}>
                    <h2 className={styles.title}>Корзина</h2>
                    <span className={styles.dateOrder}>{date.date} / {date.time}</span>
                    <div className={styles.wrapperProducts}>
                        {mode == 'with_formats' ? (basketProducts && (basketProducts.map((product, index) => (
                            <ProductBasket product={product}
                                toggleSelect={(element: string) => toggleSelect(element, product)}
                                checkSelectPhoto={() => { return false; }}
                                selectPhotos={[]} key={index}
                                openPreviewModal={handleOpenPreviewModal}
                                onOpen={(photoProduct: { image: string; quantity: number; }) => handleOpenEdit(photoProduct, product)}
                                dir={directories.photos}
                                mode={mode} />
                        ))))
                            : (
                                <ProductBasket images={order.images}
                                    toggleSelect={(element: string) => toggleSelect(element)}
                                    checkSelectPhoto={() => { return false; }}
                                    selectPhotos={[]}
                                    openPreviewModal={handleOpenPreviewModal}
                                    dir={directories.photos} mode={mode} />
                            )
                        }
                    </div>
                </div>
                <div className={styles.wrapperLink} onClick={() => confirmOrder()}>
                    <ButtonSecondary text='Подтвердить заказ' width={444} /></div>
            </div>)}
            {showModal && createPortal(
                <TheModal open={showModal} handleClose={closeTypeProduct}>
                    {selectPhoto &&
                        <div className={styles.wrapperSliderPhotoProduct}>
                            <SliderPhotoProductType activeSlide={activeSlideTypeProduct}
                                images={order ? order.images.map((image) => { return image.image }) : null}
                                switchSelectePhoto={switchSelectePhoto}
                                selectPhotos={order?.images ?? []}
                                dir={directories.photos} />
                        </div>}
                    <FormTypeProduct onClose={closeTypeProduct}
                        confirmFn={addPhotoOrder} error={false} products={products.docs}
                        selectProducts={currentImageProducts} selectPhoto={selectPhoto}
                        selectFormatForAll={selectFormatForAll} formatForAll={formatForAll}
                    />
                </TheModal>,
                document.body)}
            {showPreviewModal && createPortal(
                <PreviewPhoto dir={directories.photos}
                    selectPhotos={order?.images ?? []} open={showPreviewModal}
                    handleClose={handleClosePreviewModal}
                    activeSlide={activeSlide}
                    images={order ? order.images.map((image) => { return image.image }) : null}
                />,
                document.body
            )}
            {success && (<SuccessOrder title={'Супер! Ваш заказ сформирован.'} tel_number={telNumber} />)}
        </div>
    );
};

export default Basket;
