'use client';

import React, { useEffect, useState } from 'react';
import { NavigationBar } from '@/components/Client/NavigationBar/NavigationBar';
import styles from './style.module.scss';
import ProductBasket from '@/components/Client/ProductBasket/ProductBasket';
import { ButtonSecondary } from '@/components/Client/UI/ButtonSecondary/ButtonSecondary';
import { useRouter } from 'next/navigation';
import SuccessOrder from '@/components/Client/SuccessOrder/SuccessOrder';
import { createPortal } from 'react-dom';
import { TheModal } from '@/components/Client/TheModal/TheModal';
import { useEditOrder } from '@/hooks/Order/useEditPhoto';
import { useOrderId } from '@/hooks/Order/useOrderId';
import { useOrder } from '@/providers/OrderProvider';
import { formattedDate } from '@/services/formattedDate';
import { BasketProduct, basketProductsFn } from '@/services/basketProducts';
import { totalQuantityFn } from '@/services/totalQuantity';
import { FormTypeProduct } from '@/components/Client/FormTypeProduct/FormTypeProduct';
import { PreviewPhoto } from '@/components/Client/PreviewPhoto/PreviewPhoto';
import { SliderPhotoProductType } from '@/components/Client/SliderPhotoProductType/SliderPhotoProductType';
import { useProducts } from '@/hooks/Products/useGetProducts';
import { useFunctionalMode } from '@/providers/FunctionalMode';
import { useShowModalGlobal } from '@/providers/ShowModal';
import { parseFoldersFromPath } from '@/services/parseFoldersFromPath';
import { dir } from 'console';

const EditOrder = () => {
    const router = useRouter();
    const [success, setSuccess] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const { orderId, quantityProducts, basketProducts, setBasketProducts, setQuantityProducts, setOrderId, directories, formatForAll,
        handleSetFormatForAll, setLastFolder, lastFolder } = useOrder();
    const { order } = useOrderId(orderId);
    const { handleDeleteProduct, editOrder, applyFormatAllPhotos, handleDeletePhoto, handleTogglePrintOrder } = useEditOrder();
    const [telNumber, setTelNumber] = useState('');
    const [selectPhoto, setSelectPhoto] = useState<string | null>(null);
    const [activeSlideTypeProduct, setActiveSlideTypeProduct] = useState<number | null>(null);
    const [activeSlide, setActiveSlide] = useState<number | null>(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [currentImageProducts, setCurrentImageProducts] = useState(null);
    const { products } = useProducts();
    const { mode } = useFunctionalMode();
    const { showModalGlobal, setShowModalGlobal } = useShowModalGlobal();

    const confirmOrder = () => {
        setTelNumber(order.tel_number)
        setOrderId(null);
        setSuccess(true)
    }

    const addPhoto = () => {
        const imagesCopy = [...order.images];
        // Сортируем по возрастанию addedAt (старые → новые):
        imagesCopy.sort((a, b) => {
            return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
        });
        const latestImage = imagesCopy[imagesCopy.length - 1].image;
        console.log(latestImage);
        const pathFolders = parseFoldersFromPath(latestImage, directories.photos);
        console.log(pathFolders);
        console.log(lastFolder);
        setLastFolder(prev => {
            const base = prev.length > 0 ? [prev[0]] : [];
            return [...base, ...pathFolders];
        });
        router.push(`/search-photo`);
    }

    const toggleSelect = (el: string, product?) => {
        if (!orderId) {
            console.error('Заказ не открыт. Невозможно удалить фото.');
            return;
        }
        if (mode == 'with_formats' && product.product !== 'Фото без форматов') {
            handleDeleteProduct(el, orderId, order, product)
        } else { handleDeletePhoto(el, orderId, order) }
    }

    const togglePrint = (el: string) => {
        if (!orderId) {
            console.error('Заказ не открыт. Невозможно изменить значение.');
            return;
        } else {
            handleTogglePrintOrder(orderId, el, order)
        }
    }

    useEffect(() => {
        if (!order) { return }
        if (mode == 'with_formats') {
            const orderForBasket = basketProductsFn(order.images);
            const imageNoProducts: BasketProduct[] = order.images
                .filter(item => item.products.length === 0)
                .map(item => { return { image: item.image, quantity: 0 } });
            if (imageNoProducts.length) {
                setBasketProducts([...orderForBasket, { product: 'Фото без форматов', photos: imageNoProducts }]);
            } else {
                setBasketProducts(orderForBasket);
            }
            setQuantityProducts(totalQuantityFn(orderForBasket));
            const products = order.images.find((item) => item.image === selectPhoto);
            setCurrentImageProducts(products ? products.products : null);
        } else {
            setQuantityProducts(order.images.length)
        }
    }, [order])

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

    const switchSelectePhoto = (image) => {
        setSelectPhoto(image);
        const products = order.images.find((item) => item.image === image);
        setCurrentImageProducts(products ? products.products : null);
    }

    const addPhotoOrder = (productsWithPhoto) => {
        editOrder(productsWithPhoto, orderId, selectPhoto, order);
    }

    const selectFormatForAll = (id, value, format) => {
        handleSetFormatForAll(id, format);
        if (value) {
            applyFormatAllPhotos({ id, format }, orderId, order, selectPhoto)
        }
    }

    const dateFn = () => {
        const localeString = new Date(order.createdAt).toLocaleString();
        const [date, time] = localeString.split(', ');
        const timeWithoutSeconds = time.slice(0, 5);
        return { date, time: timeWithoutSeconds };
    }

    const navigationBack = () => {
        router.back();
    }

    const navigationExit = () => {
        if (orderId) {
            setShowModalGlobal(true)
        } else {
            router.push('/');
        }
    }

    const checkPrintPhoto = (el) => {
        if (order) {
            const result = order.images.find(item => item.image === el);
            console.log(result)
            if (result) {
                return result.print
            } else {
                return false
            }
        } return false
    }

    return (
        <>
            {!success && (<div>
                <NavigationBar basket={true} totalQuantity={quantityProducts} navigationBack={navigationBack}
                    btnExit={true} navigationExit={navigationExit} btnBack={true} />
                {order && (<><span className={styles.breadcrumbs}>Заказы / {formattedDate(order.createdAt)} / {dateFn().time} / {order.tel_number}</span><div className={styles.EditOrder}>
                    <h2 className={styles.title}>Заказ № {order.tel_number}</h2>
                    <span className={styles.dateOrder}>{formattedDate(order.createdAt)} / {dateFn().time}</span>
                    <div className={styles.wrapperProducts}>
                        {mode == 'with_formats' ? (basketProducts && (basketProducts.map((product, index) => (
                            <ProductBasket product={product}
                                images={[]}
                                toggleSelect={(element: string) => toggleSelect(element, product)}
                                checkSelectPhoto={() => { return false; }}
                                selectPhotos={[]} key={index}
                                openPreviewModal={handleOpenPreviewModal}
                                onOpen={(photoProduct: { image: string; quantity: number; }) => handleOpenEdit(photoProduct, product)}
                                dir={directories.photos}
                                mode={mode} />
                        )))) : (
                            <ProductBasket images={order.images}
                                togglePrint={(element: string) => togglePrint(element)}
                                toggleSelect={(element: string) => toggleSelect(element)}
                                checkSelectPhoto={() => { return false; }}
                                selectPhotos={[]}
                                openPreviewModal={handleOpenPreviewModal}
                                dir={directories.photos} mode={mode} />
                        )}
                    </div>
                </div><div className={styles.wrapperBtn}>
                        <ButtonSecondary text='Добавить фото' width={444} onClick={() => addPhoto()} />
                        <ButtonSecondary text='Подтвердить' width={444} onClick={() => confirmOrder()} />
                    </div></>)}
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
                <PreviewPhoto
                    mode={mode}
                    dir={directories.photos}
                    toggleSelect={toggleSelect}
                    togglePrint={togglePrint}
                    open={showPreviewModal}
                    handleClose={handleClosePreviewModal}
                    activeSlide={activeSlide}
                    images={order ? order.images.map((image) => { return image.image }) : null}
                    fromBasket
                    checkPrintPhoto={checkPrintPhoto}
                />,
                document.body
            )}
            {success && (<SuccessOrder title={'Супер! Ваш заказ отредактирован.'} tel_number={telNumber} />)}</>
    );
};

export default EditOrder;
