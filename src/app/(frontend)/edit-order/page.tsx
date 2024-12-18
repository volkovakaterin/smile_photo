'use client';

import React, { useEffect, useState } from 'react';
import { NavigationBar } from '@/components/Client/NavigationBar/NavigationBar';
import styles from './style.module.scss';
import ProductBasket from '@/components/Client/ProductBasket/ProductBasket';
import { ButtonSecondary } from '@/components/Client/UI/ButtonSecondary/ButtonSecondary';
import { useRouter } from 'next/navigation';
import SuccessOrder from '@/components/Client/SuccessOrder/SuccessOrder';
import { FormEditQuantity } from '@/components/Client/FormEditQuantity/FormEditQuantity';
import { createPortal } from 'react-dom';
import { TheModal } from '@/components/Client/TheModal/TheModal';
import { useEditOrder } from '@/hooks/Order/useEditPhoto';
import { useOrderId } from '@/hooks/Order/useOrderId';
import { useOrder } from '@/providers/OrderProvider';
import { formattedDate } from '@/services/formattedDate';
import { basketProductsFn } from '@/services/basketProducts';
import { totalQuantityFn } from '@/services/totalQuantity';

const EditOrder = () => {
    const router = useRouter();
    const [success, setSuccess] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const { orderId, quantityProducts, basketProducts, setBasketProducts, setQuantityProducts, setOrderId, directories } = useOrder();
    const { order } = useOrderId(orderId);
    const { handleDeleteProduct, handleEditQuantityProduct } = useEditOrder();
    const [selectPhotoProduct, setSelectPhotoProduct] = useState<{ image: string, quantity: number } | null>(null);
    const [telNumber, setTelNumber] = useState('');

    const confirmOrder = () => {
        setTelNumber(order.tel_number)
        setOrderId(null);
        setSuccess(true)
    }

    const addPhoto = () => {
        router.push(`/search-photo`);
    }

    const toggleSelect = (element: string, product) => {
        if (!orderId) {
            console.error('Заказ не открыт. Невозможно удалить фото.');
            return;
        }
        handleDeleteProduct(element, orderId, order, product);

    }

    useEffect(() => {
        if (!order) { return }
        const orderForBasket = basketProductsFn(order.images);
        setBasketProducts(orderForBasket);
        setQuantityProducts(totalQuantityFn(orderForBasket));
    }, [order])

    const handleOpenEdit = (photoProduct, product) => {
        const dataProduct = { image: photoProduct.image, quantity: photoProduct.quantity, label: product.product }
        setSelectPhotoProduct(dataProduct);
        setShowModal(true)
    }

    const confirmChangeQuantity = (newQuantity) => {
        if (!orderId) {
            console.error('Заказ не открыт. Невозможно изменить заказ.');
            return;
        }
        handleEditQuantityProduct(orderId, order, selectPhotoProduct, newQuantity.quantity)
        setSelectPhotoProduct(null)
    }

    const dateFn = () => {
        const localeString = new Date(order.createdAt).toLocaleString();
        const [date, time] = localeString.split(', ');
        const timeWithoutSeconds = time.slice(0, 5);
        return { date, time: timeWithoutSeconds };
    }

    return (
        <>
            {!success && (<div>
                <NavigationBar basket={true} totalQuantity={quantityProducts} />
                {order && (<><span className={styles.breadcrumbs}>Заказы / {formattedDate(order.createdAt)} / {dateFn().time} / {order.tel_number}</span><div className={styles.EditOrder}>
                    <h2 className={styles.title}>Заказ № {order.tel_number}</h2>
                    <span className={styles.dateOrder}>{formattedDate(order.createdAt)} / {dateFn().time}</span>
                    <div className={styles.wrapperProducts}>
                        {basketProducts && (basketProducts.map((product, index) => (
                            <ProductBasket product={product}
                                images={[]}
                                toggleSelect={(element: string) => toggleSelect(element, product)}
                                checkSelectPhoto={() => { return false; }}
                                selectPhotos={[]} key={index}
                                onOpen={(photoProduct: { image: string; quantity: number; }) => handleOpenEdit(photoProduct, product)}
                                dir={directories.photos} />
                        )))}
                    </div>
                </div><div className={styles.wrapperBtn}>
                        <ButtonSecondary text='Добавить фото' width={444} onClick={() => addPhoto()} />
                        <ButtonSecondary text='Подтвердить' width={444} onClick={() => confirmOrder()} />
                    </div></>)}
            </div>)}
            {showModal && createPortal(
                <TheModal open={showModal} handleClose={() => setShowModal(false)}>
                    <FormEditQuantity onClose={() => setShowModal(false)} quantity={selectPhotoProduct?.quantity ?? 0}
                        confirmChange={confirmChangeQuantity} />
                </TheModal>,
                document.body
            )}
            {success && (<SuccessOrder title={'Супер! Ваш заказ отредактирован.'} tel_number={telNumber} />)}</>
    );
};

export default EditOrder;
