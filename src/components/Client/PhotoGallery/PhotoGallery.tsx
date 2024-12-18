'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import styles from './PhotoGallery.module.scss';
import { PhotoCard } from '../PhotoCard/PhotoCard';
import { createPortal } from 'react-dom';
import { FormTypeProduct } from '../FormTypeProduct/FormTypeProduct';
import { TheModal } from '../TheModal/TheModal';
import { PreviewPhoto } from '../PreviewPhoto/PreviewPhoto';
import { useQueryClient } from '@tanstack/react-query';
import { useOrder } from '@/providers/OrderProvider';
import { FormCreateOrder } from '../FormCreateOrder/FormCreateOrder';
import { useOrderId } from '@/hooks/Order/useOrderId';
import { useCreateOrder } from '@/hooks/Order/useCreateOrder';
import { useEditOrder } from '@/hooks/Order/useEditPhoto';
import { basketProductsFn } from '@/services/basketProducts';
import { totalQuantityFn } from '@/services/totalQuantity';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useProducts } from '@/hooks/Products/useGetProducts';
import axios from 'axios';
import { SliderPhotoProductType } from '../SliderPhotoProductType/SliderPhotoProductType';

const limit = 20;

interface PhotoGalleryProps {
    folderPath: string;
}


export const PhotoGallery = memo(({ folderPath }: PhotoGalleryProps) => {
    const [activeSlide, setActiveSlide] = useState<number | null>(null);
    const [activeSlideTypeProduct, setActiveSlideTypeProduct] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showTypeProduct, setShowTypeProduct] = useState(false);
    const [showOpenOrder, setShowOpenOrder] = useState(false);
    const queryClient = useQueryClient();
    const { orderId, setOrderId, basketProducts, setBasketProducts, quantityProducts, setQuantityProducts } = useOrder();
    const [error, setError] = useState(false);
    const [selectPhoto, setSelectPhoto] = useState<string | null>(null);
    const { order } = useOrderId(orderId);
    const { mutate, isPending, isError, isSuccess } = useCreateOrder();
    const { handleDeletePhoto, handleAddPhotoOrder, editOrder } = useEditOrder();
    const { products } = useProducts();
    const [containerWidth, setContainerWidth] = useState(0);
    const [columns, setColumns] = useState(1);
    const columnPercent = 19; // Ширина колонки в процентах
    const { directories } = useOrder();
    const [currentImageProducts, setCurrentImageProducts] = useState(null);

    async function fetchImages({ pageParam = 0, folderPath }) {
        const photosDirectory = directories.photos;
        const response = await axios.get('/api/check-images', {
            params: {
                folderPath,
                photosDirectory,
                offset: pageParam * limit,
            },
        });

        return {
            rows: response.data.images || [],
            nextOffset: response.data.hasImages ? pageParam + 1 : undefined,
            hasNextPage: response.data.hasNextPage,
        };
    }

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['images'],
        queryFn: ({ pageParam = 0 }) => fetchImages({ pageParam, folderPath }),
        getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.nextOffset : undefined,
        initialPageParam: 0,
    });

    const allImages = data ? data.pages.flatMap((page) => page.rows) : [];
    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: Math.ceil(allImages.length / columns), // Число строк
        getScrollElement: () => parentRef.current,
        estimateSize: () => 187, // Высота строки
        overscan: 0,
    });

    const columnVirtualizer = useVirtualizer({
        horizontal: true,
        count: columns, // Динамическое количество колонок
        getScrollElement: () => parentRef.current,
        estimateSize: () => containerWidth * (columnPercent / 100), // Динамическая ширина колонки
        overscan: 0,
    });

    useEffect(() => {
        const updateColumns = () => {
            if (parentRef.current) {
                const width = parentRef.current.offsetWidth;
                setContainerWidth(width);
                // Рассчитываем количество колонок, учитывая ширину одной колонки и промежутки
                const calculatedColumns = Math.floor(width / (width * (columnPercent / 100)));
                setColumns(Math.max(1, calculatedColumns)); // Минимум одна колонка
            }
        };

        const resizeObserver = new ResizeObserver(updateColumns);
        if (parentRef.current) {
            resizeObserver.observe(parentRef.current);
        }

        return () => resizeObserver.disconnect();
    }, [columnPercent]);

    useEffect(() => {
        const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
        if (lastItem?.index >= allImages.length / columns - 1 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, fetchNextPage, allImages.length, isFetchingNextPage, rowVirtualizer.getVirtualItems(), columns]);

    const handleClose = () => {
        setShowModal(false);
        setActiveSlide(null);
    }

    const openPreview = (index) => {
        setActiveSlide(index);
        setShowModal(true);
    }

    useEffect(() => {
        if (!order) { return }
        console.log('обновляем заказ для корзины')
        const orderForBasket = basketProductsFn(order.images);
        setBasketProducts(orderForBasket);
        setQuantityProducts(totalQuantityFn(orderForBasket));
    }, [order])

    const handleCreateOrder = (formData) => {
        console.log('handleCreateOrder')
        const body = { tel_number: formData.phone.replace(/\s+/g, '') }
        mutate(body, {
            onSuccess: (data: any) => {
                console.log('Заказ успешно открыт:', data);
                setShowOpenOrder(false);
                setOrderId(data.doc.id);
                setShowTypeProduct(true);
                queryClient.invalidateQueries({ queryKey: ['add order'] });
            },
            onError: (error) => {
                console.error('Ошибка при открытии заказа:', error);
                setError(true);
            },
        });
    };

    const addPhotoOrder = (productsWithPhoto) => {
        editOrder(productsWithPhoto, orderId, selectPhoto, order);
    }

    const toggleSelect = (element: string, select: boolean, index: number) => {
        if (!orderId) {
            setSelectPhoto(element);
            setActiveSlideTypeProduct(index);
            setShowOpenOrder(true);
            setError(false);
        } else {
            if (select) {
                handleDeletePhoto(element, orderId, order)
                setActiveSlideTypeProduct(null);
            } else {
                setSelectPhoto(element);
                setActiveSlideTypeProduct(index);
                setShowTypeProduct(true);
            }
        }
    }

    const switchSelectePhoto = (image) => {
        setSelectPhoto(image);
        const products = order.images.find((item) => item.image === image);
        console.log(products)
        setCurrentImageProducts(products ? products.products : null);
    }



    const closeTypeProduct = () => {
        setShowTypeProduct(false);
        setSelectPhoto(null);
        setActiveSlideTypeProduct(null);
    }

    const closeOpenOrder = () => {
        setShowOpenOrder(false)
        setError(false);
    }

    const checkSelectPhoto = (element) => {
        if (order) {
            const result = order.images.find(item => item.image === element);
            if (result) {
                return true
            } else {
                return false
            }
        } return false
    }

    return (
        <div className={styles.PhotoGallery}>
            <div className={styles.wrapperImages} ref={parentRef}
                style={{
                    height: 'calc(100vh - 240px)',
                    overflow: 'auto',
                    position: 'relative',
                }}>
                <div className={styles.wrapperImagesFlex} style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: `${containerWidth}px`,
                    position: 'relative',
                }}>
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => (
                        <React.Fragment key={virtualRow.key}>
                            {columnVirtualizer.getVirtualItems().map((virtualColumn) => {
                                const itemIndex = virtualRow.index * columns + virtualColumn.index;
                                const photoNone = itemIndex >= allImages.length;
                                const image = allImages[itemIndex];

                                return (
                                    <div
                                        key={`${virtualRow.key}-${virtualColumn.key}`}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: `${containerWidth * (columnPercent / 100)}px`, // Ширина колонки
                                            height: `${virtualRow.size}px`,

                                            transform: `translateX(${virtualColumn.start +
                                                (virtualColumn.index > 0 ? (containerWidth * 0.0125 * virtualColumn.index) : 0)}px) 
                                            translateY(${virtualRow.start}px)`,
                                        }}
                                    >
                                        {!photoNone && (
                                            <PhotoCard key={image} image={image} onClick={openPreview} index={itemIndex}
                                                selectPhotos={order?.images ?? []}
                                                toggleSelect={toggleSelect}
                                                checkSelectPhoto={checkSelectPhoto} dir={directories.photos}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
            {showModal && createPortal(
                <PreviewPhoto dir={directories.photos}
                    selectPhotos={order?.images ?? []} open={showModal}
                    handleClose={handleClose} activeSlide={activeSlide} images={allImages}
                    toggleSelect={toggleSelect}
                    checkSelectPhoto={checkSelectPhoto}
                />,
                document.body
            )}
            {showTypeProduct && createPortal(
                <TheModal open={showTypeProduct} handleClose={closeTypeProduct}>
                    {selectPhoto &&
                        <div className={styles.wrapperSliderPhotoProduct}><SliderPhotoProductType activeSlide={activeSlideTypeProduct}
                            images={allImages}
                            switchSelectePhoto={switchSelectePhoto}
                            selectPhotos={order?.images ?? []} dir={directories.photos} />
                        </div>}
                    <FormTypeProduct onClose={closeTypeProduct}
                        confirmFn={addPhotoOrder} error={false} products={products.docs}
                        selectProducts={currentImageProducts} selectPhoto={selectPhoto} />
                </TheModal>,
                document.body
            )}
            {showOpenOrder && createPortal(
                <TheModal open={showOpenOrder} handleClose={closeOpenOrder} ><FormCreateOrder
                    confirmFn={handleCreateOrder} error={error} /></TheModal>,
                document.body
            )}
        </div>
    );
});

