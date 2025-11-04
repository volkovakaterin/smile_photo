'use client';

import { memo, useRef } from 'react';
import styles from './SlidePreview.module.scss';
import path from 'path';
import Image from 'next/image';


interface SlidePreviewProps {
    image: string;
    fromBasket?: boolean;
}

export const SlidePreview = memo(({ image,
}: SlidePreviewProps) => {
    const imgRef = useRef<HTMLImageElement | null>(null);


    return (
        <div className={styles.SlidePreview}>
            <div key={image} className={styles.sliderItem}>
                {image ? <Image
                    unoptimized={true}
                    fill
                    className={styles.image}
                    style={{ height: '100%', objectFit: 'contain' }}
                    ref={imgRef}
                    src={`/api/dynamic-thumbnail?img=${image}&width=1500&height=1500`}
                    alt="Image"
                /> : null}
            </div>
            <div className={styles.photoNameWrap}>
                <div className={styles.photoName}>{path.basename(image)}</div>
            </div>
        </div>
    )
});

