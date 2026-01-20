'use client';

import { memo, useRef } from 'react';
import styles from './SlidePreview.module.scss';
import path from 'path';
import Image from 'next/image';

interface SlidePreviewProps {
    image: string;
    mtimeMs?: number;
    fromBasket?: boolean;
    refreshToken?: number;
    basketVisitId?: number;
}

export const SlidePreview = memo(({ image, mtimeMs, refreshToken, fromBasket, basketVisitId }: SlidePreviewProps) => {
    const imgRef = useRef<HTMLImageElement | null>(null);

    const w = 1500;
    const h = 1500;

    const base = `/api/dynamic-thumbnail?img=${encodeURIComponent(image)}&width=${w}&height=${h}`;

    // Галерея: ver по mtimeMs
    const gallerySrc = mtimeMs ? `${base}&ver=${mtimeMs}` : base;

    // ✅ Корзина: всегда форс по basketVisitId (чтобы не было откатов)
    const basketSrc = basketVisitId ? `${base}&v=${basketVisitId}` : base;

    const src = fromBasket ? basketSrc : gallerySrc;

    return (
        <div className={styles.SlidePreview}>
            <div className={styles.sliderItem}>
                {image ? (
                    <Image
                        unoptimized
                        fill
                        className={styles.image}
                        style={{ height: '100%', objectFit: 'contain' }}
                        ref={imgRef}
                        src={src}
                        alt="Image"
                    />
                ) : null}
            </div>

            <div className={styles.photoNameWrap}>
                <div className={styles.photoName}>{path.basename(image)}</div>
            </div>
        </div>
    );
});
