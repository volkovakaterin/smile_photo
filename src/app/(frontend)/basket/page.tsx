'use client';

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
import { PreviewPhoto } from '@/components/Client/PreviewPhoto/PreviewPhoto';
import { useFunctionalMode } from '@/providers/FunctionalMode';
import { useRouter, usePathname } from 'next/navigation';
import { useShowModalGlobal } from '@/providers/ShowModal';

type RefreshMap = Record<string, number>;

const W = 200;
const H = 200;

const ETAG_MEM = new Map<string, string>();

function getStoredEtag(key: string): string | null {
    const m = ETAG_MEM.get(key);
    if (m) return m;
    try {
        const s = localStorage.getItem(`thumb-etag:${key}`);
        if (s) ETAG_MEM.set(key, s);
        return s || null;
    } catch {
        return null;
    }
}

function hash32(s: string) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0);
}

function storeEtag(key: string, etag: string) {
    ETAG_MEM.set(key, etag);
    try {
        localStorage.setItem(`thumb-etag:${key}`, etag);
    } catch { }
}

function makeThumbKey(path: string, w: number, h: number) {
    return `${path}__${w}x${h}`;
}

export type ProductBasketType = { product: string; photos: { image: string; quantity: number }[] };
type AnyImage = { image?: unknown; mtimeMs?: unknown };

const normalizePath = (p: unknown): string => String(p ?? '').replace(/\\/g, '/');

const toPreviewImages = (imgs?: AnyImage[]) =>
    (imgs ?? [])
        .map((x) => ({
            path: normalizePath(typeof x?.image === 'string' ? x.image : ''),
            mtimeMs: typeof x?.mtimeMs === 'number' ? x.mtimeMs : undefined,
        }))
        .filter((x) => x.path.length > 0);

const Basket = () => {
    const [showModal, setShowModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [success, setSuccess] = useState(false);

    const {
        orderId,
        quantityProducts,
        basketProducts,
        setBasketProducts,
        setQuantityProducts,
        directories,
    } = useOrder();

    const { order } = useOrderId(orderId);
    const { handleDeleteProduct, handleDeletePhoto } = useEditOrder();
    const { handleChangeStatusOrder } = useStatusChangeOrder();

    const [date, setDate] = useState<{ date: string; time: string }>({ date: '', time: '' });
    const [orderName, setOrderName] = useState('');

    const [activeSlideTypeProduct, setActiveSlideTypeProduct] = useState<number | null>(null);
    const [activeSlide, setActiveSlide] = useState<number | null>(null);

    const [selectPhoto, setSelectPhoto] = useState<string | null>(null);
    const [currentImageProducts, setCurrentImageProducts] = useState<any>(null);

    const { mode } = useFunctionalMode();
    const { setShowModalGlobal } = useShowModalGlobal();

    const router = useRouter();
    const pathname = usePathname();

    const [basketVisitId, setBasketVisitId] = useState<number>(0);
    const [refreshMap, setRefreshMap] = useState<RefreshMap>({});


    useEffect(() => {
        if (pathname === '/basket' && basketVisitId === 0) {
            setBasketVisitId(Date.now());
        }
    }, []);

    useEffect(() => {
        if (pathname === '/basket') {
            setBasketVisitId(Date.now());
        }
    }, [pathname]);

    // ✅ BFCache restore
    useEffect(() => {
        const onPageShow = (e: PageTransitionEvent) => {
            if (e.persisted) {
                setBasketVisitId(Date.now());
            }
        };
        window.addEventListener('pageshow', onPageShow);
        return () => window.removeEventListener('pageshow', onPageShow);
    }, []);

    // ✅ CHECK: сравниваем ETag через check=1 и локальное хранилище
    useEffect(() => {
        if (!orderId) return;
        if (!order?.images?.length) return;
        if (!basketVisitId) return;

        const controller = new AbortController();

        (async () => {
            const uniquePaths: string[] = Array.from(
                new Set(order.images.map((it: any) => normalizePath(it?.image)))
            ).filter((p): p is string => typeof p === 'string' && p.length > 0);

            const nextVersions: Record<string, number> = {};

            await Promise.all(
                uniquePaths.map(async (p: string) => {
                    const key = makeThumbKey(p, W, H);
                    const prevEtag = getStoredEtag(key);

                    const url = `/api/dynamic-thumbnail?img=${encodeURIComponent(p)}&width=${W}&height=${H}&check=1`;

                    const headers: Record<string, string> = {};
                    if (prevEtag) headers['If-None-Match'] = prevEtag;

                    const res = await fetch(url, {
                        method: 'GET',
                        cache: 'no-store',
                        headers,
                        signal: controller.signal,
                    }).catch(() => null);

                    if (!res) return;

                    const newEtag = res.headers.get('ETag');

                    if (newEtag) {
                        storeEtag(key, newEtag);
                        nextVersions[p] = hash32(newEtag);
                    } else if (prevEtag) {
                        nextVersions[p] = hash32(prevEtag);
                    }
                })
            );

            if (Object.keys(nextVersions).length) {
                setRefreshMap((prev) => ({ ...prev, ...nextVersions }));
            }
        })();

        return () => controller.abort();
    }, [basketVisitId, orderId, order?.images]);


    const confirmOrder = () => {
        if (!order) return;
        setOrderName(order.tel_number || order.folder_name);
        handleChangeStatusOrder('created', orderId);
        setSuccess(true);
    };

    useEffect(() => {
        if (!order) return;

        if (mode === 'with_formats') {
            const orderForBasket = basketProductsFn(order.images);
            setBasketProducts(orderForBasket);
            setQuantityProducts(totalQuantityFn(orderForBasket));

            const found = order.images.find((item: any) => item.image === selectPhoto);
            setCurrentImageProducts(found?.products ?? null);
        } else {
            setQuantityProducts(order.images.length);
        }
    }, [order]);

    const toggleSelect = (el: string, product?: any) => {
        if (!orderId) return;

        if (mode === 'with_formats') {
            handleDeleteProduct(el, orderId, order, product);
        } else {
            handleDeletePhoto(el, orderId, order);
        }
    };

    const handleOpenEdit = (photoProduct: any, product: any) => {
        if (!order) return;
        const index = order.images.findIndex((item: any) => item.image === photoProduct.image);

        setSelectPhoto(photoProduct.image);
        const found = order.images.find((item: any) => item.image === photoProduct.image);
        setCurrentImageProducts(found?.products ?? null);

        setActiveSlideTypeProduct(index);
        setShowModal(true);
    };

    const closeTypeProduct = () => {
        setShowModal(false);
        setSelectPhoto(null);
        setActiveSlideTypeProduct(null);
    };

    const handleClosePreviewModal = () => {
        setShowPreviewModal(false);
        setActiveSlide(null);
    };

    const handleOpenPreviewModal = (image: any) => {
        if (!order) return;
        const img = normalizePath(image);
        const index = order.images.findIndex((item: any) => normalizePath(item.image) === img);
        if (index < 0) return;
        setShowPreviewModal(true);
        setActiveSlide(index);
    };

    useEffect(() => {
        if (!orderId || !order?.createdAt) return;
        const d = new Date(order.createdAt);

        const formattedDate = d.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

        const formattedTime = d.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
        });

        setDate({ date: formattedDate, time: formattedTime });
    }, [order, orderId]);

    const getImagePath = (v: any) => {
        if (typeof v === 'string') return v;
        if (Array.isArray(v)) return v[0] ?? '';
        if (v && typeof v === 'object') return v.image ?? v.path ?? '';
        return '';
    };

    const switchSelectePhoto = (image: any) => {
        if (!order) return;
        const img = normalizePath(getImagePath(image));
        setSelectPhoto(img);

        const found = order.images.find((item: any) => normalizePath(item.image) === img);
        setCurrentImageProducts(found?.products ?? null);
    };

    const navigationBack = () => router.push('/search-photo');

    const navigationExit = () => {
        if (orderId) {
            setShowModalGlobal(true);
        } else {
            router.push('/');
        }
    };

    useEffect(() => {
        if (!order?.images?.length) {
            handleClosePreviewModal();
        }
    }, [order?.images?.length]);

    if (!order) return null;

    return (
        <div>
            {!success && (
                <div>
                    <NavigationBar
                        basket={true}
                        totalQuantity={quantityProducts}
                        navigationBack={navigationBack}
                        btnExit={true}
                        navigationExit={navigationExit}
                        btnBack={true}
                    />

                    <div className={styles.Basket}>
                        <h2 className={styles.title}>Корзина</h2>

                        <div className={styles.infoWrapper}>
                            <span className={styles.dateOrder}>
                                {date.date} / {date.time}
                            </span>

                            {order.folder_name && <span className={styles.nameOrder}>Заказ № {order.folder_name}</span>}
                            {order.tel_number && <span className={styles.nameOrder}>Заказ № {order.tel_number}</span>}

                            {order.number_photos_in_folders && (
                                <span className={styles.nameOrder}>
                                    Всего фото в папке{' '}
                                    {order.number_photos_in_folders?.reduce((sum: number, item: any) => sum + item.number_photos, 0)}
                                </span>
                            )}
                        </div>

                        <div className={styles.wrapperProducts}>
                            {mode === 'with_formats' ? (
                                basketProducts &&
                                basketProducts.map((product: any, index: number) => (
                                    <ProductBasket
                                        key={index}
                                        product={product}
                                        toggleSelect={(element: string) => toggleSelect(element, product)}
                                        checkSelectPhoto={() => false}
                                        selectPhotos={[]}
                                        openPreviewModal={handleOpenPreviewModal}
                                        onOpen={(photoProduct: { image: string; quantity: number }) => handleOpenEdit(photoProduct, product)}
                                        dir={directories.photos}
                                        mode={mode}
                                    />
                                ))
                            ) : (
                                <ProductBasket
                                    images={order.images}
                                    basketVisitId={basketVisitId}
                                    refreshMap={refreshMap}
                                    toggleSelect={(element: string) => toggleSelect(element)}
                                    checkSelectPhoto={() => false}
                                    selectPhotos={[]}
                                    openPreviewModal={handleOpenPreviewModal}
                                    dir={directories.photos}
                                    mode={mode}
                                />
                            )}
                        </div>
                    </div>

                    <div className={styles.wrapperLink} onClick={confirmOrder}>
                        <span style={{ width: '444px' }} className={styles.warning}>
                            Внимание, перед нажатием кнопки &apos;Подтвердить заказ&apos; согласуйте формат печати с администратором
                        </span>
                        <ButtonSecondary text="Подтвердить заказ" width={444} />
                    </div>
                </div>
            )}

            {showModal &&
                createPortal(
                    <TheModal open={showModal} handleClose={closeTypeProduct}>
                        {selectPhoto && (
                            <div className={styles.wrapperSliderPhotoProduct}>
                                <SliderPhotoProductType
                                    activeSlide={activeSlideTypeProduct}
                                    images={order ? order.images.map((it: any) => ({ path: normalizePath(it.image), mtimeMs: it.mtimeMs })) : []}
                                    switchSelectePhoto={switchSelectePhoto}
                                    selectPhotos={order?.images ?? []}
                                    dir={directories.photos}
                                />
                            </div>
                        )}
                    </TheModal>,
                    document.body
                )}

            {showPreviewModal &&
                createPortal(
                    <PreviewPhoto
                        toggleSelect={toggleSelect}
                        open={showPreviewModal}
                        handleClose={handleClosePreviewModal}
                        activeSlide={activeSlide}
                        images={toPreviewImages(order?.images)}
                        fromBasket={true}
                        basketVisitId={basketVisitId}
                    />,
                    document.body
                )}

            {success && <SuccessOrder title={'Супер! Ваш заказ сформирован.'} order_name={orderName} />}
        </div>
    );
};

export default Basket;
