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

export type ProductBasketType = { product: string; photos: { image: string; quantity: number; }[]; }

const Basket = () => {
    const [showModal, setShowModal] = useState(false);
    const [success, setSuccess] = useState(false);
    const { orderId, quantityProducts, basketProducts, setBasketProducts, setQuantityProducts, setOrderId, directories } = useOrder();
    const { order } = useOrderId(orderId);
    const { handleDeleteProduct, handleEditQuantityProduct, editOrder } = useEditOrder();
    const [selectPhotoProduct, setSelectPhotoProduct] = useState<{ image: string, label: string, quantity: number } | null>(null);
    const { handleChangeStatusOrder } = useStatusChangeOrder();
    const [date, setDate] = useState<{ date: string, time: string }>({ date: "", time: "" });
    const [telNumber, setTelNumber] = useState('');
    const [activeSlideTypeProduct, setActiveSlideTypeProduct] = useState<number | null>(null);
    const [selectPhoto, setSelectPhoto] = useState<string | null>(null);
    const [currentImageProducts, setCurrentImageProducts] = useState(null);
    const { products } = useProducts();

    const confirmOrder = () => {
        setTelNumber(order.tel_number)
        handleChangeStatusOrder('created', orderId);
        setOrderId(null);
        setSuccess(true)
    }

    useEffect(() => {
        if (!order) { return }
        const orderForBasket = basketProductsFn(order.images);
        setBasketProducts(orderForBasket);
        setQuantityProducts(totalQuantityFn(orderForBasket));
    }, [order])

    const toggleSelect = (element: string, product) => {
        console.log('toggle basket')
        if (!orderId) {
            console.error('Заказ не открыт. Невозможно удалить фото.');
            return;
        }
        handleDeleteProduct(element, orderId, order, product);

    }

    const handleOpenEdit = (photoProduct, product) => {
        const index = order.images.findIndex(item => item.image === photoProduct.image);
        setSelectPhoto(photoProduct.image);
        setCurrentImageProducts(order.images.find((item) => item.image === photoProduct.image).products || null);
        setActiveSlideTypeProduct(index);
        const dataProduct = { image: photoProduct.image, label: product.product, quantity: photoProduct.quantity }
        console.log(dataProduct)
        setSelectPhotoProduct(dataProduct);
        console.log(photoProduct.image);
        setShowModal(true)
    }

    const closeTypeProduct = () => {
        setShowModal(false);
        setSelectPhoto(null);
        setActiveSlideTypeProduct(null);
    }

    // const confirmChangeQuantity = (newQuantity) => {
    //     if (!orderId) {
    //         console.error('Заказ не открыт. Невозможно изменить заказ.');
    //         return;
    //     }
    //     handleEditQuantityProduct(orderId, order, selectPhotoProduct, newQuantity.quantity)
    //     setSelectPhotoProduct(null)
    // }

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
        console.log(products)
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
                        {basketProducts && (basketProducts.map((product, index) => (
                            <ProductBasket product={product} images={[]}
                                toggleSelect={(element: string) => toggleSelect(element, product)}
                                checkSelectPhoto={() => { return false; }}
                                selectPhotos={[]} key={index}
                                onOpen={(photoProduct: { image: string; quantity: number; }) => handleOpenEdit(photoProduct, product)}
                                dir={directories.photos} />
                        )))}
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
                        selectProducts={currentImageProducts} selectPhoto={selectPhoto} />
                </TheModal>,
                document.body

            )
            }
            {success && (<SuccessOrder title={'Супер! Ваш заказ сформирован.'} tel_number={telNumber} />)}
        </div>
    );
};

export default Basket;
