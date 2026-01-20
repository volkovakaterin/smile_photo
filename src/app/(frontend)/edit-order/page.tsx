'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { NavigationBar } from '@/components/Client/NavigationBar/NavigationBar';
import styles from './style.module.scss';
import ProductBasket from '@/components/Client/ProductBasket/ProductBasket';
import { ButtonSecondary } from '@/components/Client/UI/ButtonSecondary/ButtonSecondary';
import { useRouter, usePathname } from 'next/navigation';
import SuccessOrder from '@/components/Client/SuccessOrder/SuccessOrder';
import { createPortal } from 'react-dom';
import { TheModal } from '@/components/Client/TheModal/TheModal';
import { useEditOrder } from '@/hooks/Order/useEditPhoto';
import { useOrderId } from '@/hooks/Order/useOrderId';
import { useOrder } from '@/providers/OrderProvider';
import { formattedDate } from '@/services/formattedDate';
import { BasketProduct, basketProductsFn } from '@/services/basketProducts';
import { totalQuantityFn } from '@/services/totalQuantity';
import { SliderPhotoProductType } from '@/components/Client/SliderPhotoProductType/SliderPhotoProductType';
import { PreviewPhoto } from '@/components/Client/PreviewPhoto/PreviewPhoto';
import { useFunctionalMode } from '@/providers/FunctionalMode';
import { useShowModalGlobal } from '@/providers/ShowModal';
import { parseFoldersFromPath } from '@/services/parseFoldersFromPath';
import { useStatusChangeOrder } from '@/hooks/Order/useChangeStatusOrder';

type RefreshMap = Record<string, number>;
type AnyImage = { image?: unknown; mtimeMs?: unknown };

const W = 200;
const H = 200;

const ETAG_MEM = new Map<string, string>();

function makeThumbKey(path: string, w: number, h: number) {
    return `${path}__${w}x${h}`;
}

function hash32(s: string) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0);
}


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

function storeEtag(key: string, etag: string) {
    ETAG_MEM.set(key, etag);
    try {
        localStorage.setItem(`thumb-etag:${key}`, etag);
    } catch { }
}

const normalizePath = (p: unknown): string => String(p ?? '').replace(/\\/g, '/');

const getImagePath = (v: any) => {
    if (typeof v === 'string') return v;
    if (Array.isArray(v)) return v[0] ?? '';
    if (v && typeof v === 'object') return v.image ?? v.path ?? '';
    return '';
};

const toPreviewImages = (imgs?: AnyImage[]) =>
    (imgs ?? [])
        .map((x) => ({
            path: normalizePath(typeof x?.image === 'string' ? x.image : ''),
            mtimeMs: typeof x?.mtimeMs === 'number' ? x.mtimeMs : undefined,
        }))
        .filter((x) => x.path.length > 0);

const EditOrder = () => {
    const router = useRouter();
    const pathname = usePathname();

    const [success, setSuccess] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    const {
        orderId,
        quantityProducts,
        basketProducts,
        setBasketProducts,
        setQuantityProducts,
        setOrderId,
        directories,
        setLastFolder,
    } = useOrder();

    const { order } = useOrderId(orderId);
    const { handleDeleteProduct, handleDeletePhoto } = useEditOrder();
    const { mode } = useFunctionalMode();
    const { setShowModalGlobal } = useShowModalGlobal();
    const { handleChangeStatusOrder } = useStatusChangeOrder();

    const [orderName, setOrderName] = useState('');
    const [selectPhoto, setSelectPhoto] = useState<string | null>(null);
    const [activeSlideTypeProduct, setActiveSlideTypeProduct] = useState<number | null>(null);
    const [activeSlide, setActiveSlide] = useState<number | null>(null);
    const [currentImageProducts, setCurrentImageProducts] = useState<any>(null);

    // ✅ токен визита на страницу редактирования
    const [basketVisitId, setBasketVisitId] = useState<number>(0);

    // ✅ для миниатюр: path -> timestamp
    const [refreshMap, setRefreshMap] = useState<RefreshMap>({});


    useEffect(() => {
        setBasketVisitId(Date.now());
    }, []);

    useEffect(() => {
        if (pathname === '/edit-order') {
            setBasketVisitId(Date.now());
        }
    }, [pathname]);

    useEffect(() => {
        // BFCache restore
        const onPageShow = (e: PageTransitionEvent) => {
            if (e.persisted) setBasketVisitId(Date.now());
        };
        window.addEventListener('pageshow', onPageShow);
        return () => window.removeEventListener('pageshow', onPageShow);
    }, []);


    const sliderImages = useMemo(
        () =>
            order
                ? order.images.map((it: any) => ({
                    path: normalizePath(it.image),
                    mtimeMs: it.mtimeMs,
                }))
                : [],
        [order]
    );

    // ✅ CHECK миниатюр: сравниваем ETag через check=1
    useEffect(() => {
        if (!orderId) return;
        if (!order?.images?.length) return;
        if (!basketVisitId) return;

        const controller = new AbortController();

        (async () => {
            const uniquePaths = Array.from(
                new Set(order.images.map((it: any) => normalizePath(it?.image)))
            ).filter((p): p is string => typeof p === 'string' && p.length > 0);

            const nextVersions: Record<string, number> = {};

            await Promise.all(
                uniquePaths.map(async (p) => {
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
                        // ✅ вот тут используется hash32: превращаем ETag в число
                        nextVersions[p] = hash32(newEtag);
                    } else if (prevEtag) {
                        // на всякий случай, если ETag вдруг не пришёл
                        nextVersions[p] = hash32(prevEtag);
                    }
                })
            );

            if (Object.keys(nextVersions).length) {
                // ✅ refreshMap теперь хранит "версию" по ETag, а не Date.now()
                setRefreshMap((prev) => ({ ...prev, ...nextVersions }));
            }
        })();

        return () => controller.abort();
    }, [basketVisitId, orderId, order?.images]);


    // ---- вычисления корзины/продуктов ----
    useEffect(() => {
        if (!order) return;

        if (mode === 'with_formats') {
            const orderForBasket = basketProductsFn(order.images);

            const imageNoProducts: BasketProduct[] = order.images
                .filter((item: any) => (item.products ?? []).length === 0)
                .map((item: any) => ({ image: item.image, quantity: 0 }));

            if (imageNoProducts.length) {
                setBasketProducts([...orderForBasket, { product: 'Фото без форматов', photos: imageNoProducts }]);
            } else {
                setBasketProducts(orderForBasket);
            }

            setQuantityProducts(totalQuantityFn(orderForBasket));

            const found = order.images.find((item: any) => item.image === selectPhoto);
            setCurrentImageProducts(found?.products ?? null);
        } else {
            setQuantityProducts(order.images.length);
        }
    }, [order]);

    const confirmOrder = () => {
        console.log(order, 'confirmOrder edit-order');
        if (!order) return;
        setOrderName(order.tel_number || order.folder_name);
        handleChangeStatusOrder('created', orderId);
        setSuccess(true);
        setOrderId(null);
    };

    const addPhoto = () => {
        if (order?.images?.length) {
            const imagesCopy = [...order.images].sort((a: any, b: any) => {
                return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
            });

            const latestImage = imagesCopy[imagesCopy.length - 1].image;
            const pathFolders = parseFoldersFromPath(latestImage, normalizePath(directories.photos));

            setLastFolder((prev: any[]) => {
                const base = prev.length > 0 ? [prev[0]] : [];
                return [...base, ...pathFolders];
            });
        }
        router.push('/search-photo');
    };

    const toggleSelect = (el: string, product?: any) => {
        if (!orderId) return;

        if (mode === 'with_formats' && product?.product !== 'Фото без форматов') {
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
        const img = normalizePath(getImagePath(image));
        if (!img) return;

        const index = order.images.findIndex((item: any) => normalizePath(item.image) === img);
        if (index < 0) return;

        setShowPreviewModal(true);
        setActiveSlide(index);
    };

    const switchSelectePhoto = (image: any) => {
        if (!order) return;
        const img = normalizePath(getImagePath(image));
        setSelectPhoto(img);

        const found = order.images.find((item: any) => normalizePath(item.image) === img);
        setCurrentImageProducts(found ? found.products : null);
    };

    const navigationBack = () => router.back();

    const navigationExit = () => {
        if (orderId) setShowModalGlobal(true);
        else router.push('/');
    };

    useEffect(() => {
        if (!order?.images?.length) handleClosePreviewModal();
    }, [order?.images?.length]);

    if (!order && !success) return null;

    const dateFn = () => {
        const localeString = new Date(order.createdAt).toLocaleString();
        const [date, time] = localeString.split(', ');
        return { date, time: time.slice(0, 5) };
    };

    return (
        <>
            {!success && (
                <div>
                    <NavigationBar
                        basket
                        totalQuantity={quantityProducts}
                        navigationBack={navigationBack}
                        btnExit
                        navigationExit={navigationExit}
                        btnBack
                    />

                    <span className={styles.breadcrumbs}>
                        Заказы / {formattedDate(order.createdAt)} / {dateFn().time} / {order.tel_number}
                    </span>

                    <div className={styles.EditOrder}>
                        <h2 className={styles.title}>Заказ № {order.tel_number || order.folder_name}</h2>

                        <div className={styles.infoWrapper}>
                            <span className={styles.dateOrder}>
                                {formattedDate(order.createdAt)} / {dateFn().time}
                            </span>

                            {order.number_photos_in_folders && (
                                <span className={styles.nameOrder}>
                                    Всего фото в папке{' '}
                                    {order.number_photos_in_folders?.reduce((sum: number, item: any) => sum + item.number_photos, 0)}
                                </span>
                            )}
                        </div>

                        <div className={styles.wrapperProducts}>
                            {mode === 'with_formats' ? (
                                basketProducts?.map((product: any, index: number) => (
                                    <ProductBasket
                                        key={index}
                                        product={product}
                                        images={[]}
                                        toggleSelect={(element: string) => toggleSelect(element, product)}
                                        checkSelectPhoto={() => false}
                                        selectPhotos={[]}
                                        openPreviewModal={handleOpenPreviewModal}
                                        onOpen={(photoProduct: { image: string; quantity: number }) => handleOpenEdit(photoProduct, product)}
                                        dir={directories.photos}
                                        mode={mode}
                                        refreshMap={refreshMap}
                                        basketVisitId={basketVisitId}
                                    />
                                ))
                            ) : (
                                <ProductBasket
                                    images={order.images}
                                    toggleSelect={(element: string) => toggleSelect(element)}
                                    checkSelectPhoto={() => false}
                                    selectPhotos={[]}
                                    openPreviewModal={handleOpenPreviewModal}
                                    dir={directories.photos}
                                    mode={mode}
                                    refreshMap={refreshMap}
                                    basketVisitId={basketVisitId}
                                />
                            )}
                        </div>
                    </div>

                    <div className={styles.wrapperBtn}>
                        <ButtonSecondary text="Добавить фото" width={444} onClick={addPhoto} />
                        <div className={styles.wrapperConfirm}>
                            <span style={{ width: '444px' }} className={styles.warning}>
                                Внимание, перед нажатием кнопки &apos;Подтвердить заказ&apos; согласуйте формат печати с администратором
                            </span>
                            <ButtonSecondary text="Подтвердить" width={444} onClick={confirmOrder} />
                        </div>
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
                                    images={sliderImages}
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
                        images={sliderImages}
                        fromBasket={true}
                        basketVisitId={basketVisitId}
                    />,
                    document.body
                )}

            {success && <SuccessOrder title="Супер! Ваш заказ отредактирован." order_name={orderName} />}
        </>
    );
};

export default EditOrder;
