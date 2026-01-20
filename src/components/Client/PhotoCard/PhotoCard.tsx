'use client';

import { memo, useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './PhotoCard.module.scss';
import { ButtonWithContent } from '../UI/ButtonWithContent/ButtonWithContent';
import Delete from '@/assets/icons/icon_trash.svg';
import Basket from '@/assets/icons/icon_shop_white.svg';
import Edit from '@/assets/icons/edit-3.svg';
import path from 'path';

export type ImageType = {
    image: string; id: string;
}

interface PhotoCardProps {
    image: string;
    onClick?: (index) => void;
    index: number;
    toggleSelect: (image: string, select: boolean, index: number) => void;
    checkSelectPhoto: (element: any) => boolean;
    selectPhotos: string[];
    fromBasket?: boolean;
    onOpen?: () => void;
    quantity?: number;
    dir: string;
    openPreviewModal?: (image: string) => void;
    thumbVersion?: number;
    mtimeMs?: number;
    basketVisitId?: number;
    refreshMap?: Record<string, number>;
}

const normalizePath = (p: unknown) => String(p ?? '').replace(/\\/g, '/');


export const PhotoCard = memo(({ image, onClick, index, toggleSelect, checkSelectPhoto, selectPhotos,
    fromBasket, onOpen, quantity, openPreviewModal, thumbVersion, mtimeMs, basketVisitId, refreshMap }: PhotoCardProps) => {
    const [btnParams, setBtnParams] = useState<{ icon: string, backgroundColor: string } | undefined>(undefined);
    const [select, setSelect] = useState(false);
    const [normalizeImage, setNormalizeImage] = useState('');
    const w = 200;
    const h = 200;
    const baseNoVer =
        `/api/dynamic-thumbnail?img=${encodeURIComponent(normalizeImage)}&width=${w}&height=${h}`;

    // Только для галереи (там mtimeMs настоящий из /check-images)
    const baseWithVer =
        baseNoVer + (typeof mtimeMs === 'number' && mtimeMs > 0 ? `&ver=${mtimeMs}` : '');

    const srcGallery =
        baseWithVer + (thumbVersion ? `&v=${thumbVersion}` : ''); // v = форс

    // ✅ корзина:
    const vBasket = refreshMap?.[normalizeImage];
    const srcBasket =
        baseNoVer + '&reval=1' + (vBasket ? `&bv=${vBasket}` : '');

    const src = fromBasket ? srcBasket : srcGallery;

    const ready = !fromBasket || !!vBasket;

    useEffect(() => {
        const normalizeImage = normalizePath(image);

        setSelect(checkSelectPhoto(normalizeImage));
        setNormalizeImage(normalizeImage);
    }, [image, selectPhotos])

    useEffect(() => {
        if (select || fromBasket) {
            setBtnParams({ icon: Delete, backgroundColor: '#fff' })
        } else { setBtnParams({ icon: Basket, backgroundColor: '#F4B45C' }) }
    }, [select])

    return (
        <div style={{ paddingTop: `${!fromBasket ? '30px' : false}` }}>
            <div className={styles.PhotoCard}>
                {(fromBasket && quantity != null && quantity > 0) && (<span className={styles.quantity} onClick={onOpen}>{quantity}</span>)}
                {normalizeImage && ready ? <Image
                    unoptimized={true}
                    src={src}
                    fill alt={'photo'} onClick={
                        () => {
                            fromBasket ? (openPreviewModal && openPreviewModal(normalizeImage)) : (onClick && onClick(index))
                        }}
                    className={styles.image} /> : null}

                {!fromBasket && (<div className={styles.statusBox} onClick={() => toggleSelect(normalizeImage, select, index)} ><span className={`${styles.statusMark} ${select ? styles.visible : false}`}>
                </span>
                </div>)}
                <div className={styles.wrapperBtn}
                >
                    {(fromBasket && onOpen) && (<ButtonWithContent icon={Edit} backgroundColor={'#fff'} onClick={onOpen} />)}
                    <ButtonWithContent icon={btnParams && (btnParams.icon)} backgroundColor={btnParams && (btnParams.backgroundColor)}
                        onClick={() => toggleSelect(normalizeImage, select, index)} />
                </div>
            </div>
            <div className={styles.photoName}>{path.basename(normalizePath(decodeURIComponent(normalizeImage)))}</div>
        </div>
    );
});