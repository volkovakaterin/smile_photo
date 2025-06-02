'use client';

import { memo, useEffect, useRef, useState } from 'react';
import styles from './SlideTypeProduct.module.scss';
import Image from 'next/image';
import path from 'path';

interface SlideTypeProductProps {
    index: number;
    image: string;
    dir: string;
}

const normalizePath = (p) => p.replace(/\\/g, '/');
const ensureLeadingSlash = (p: string) => (p.startsWith('/') ? p : `/${p}`);

export const SlideTypeProduct = memo(({ index, image, dir }: SlideTypeProductProps) => {
    return (
        <div className={styles.SlideTypeProduct}>
            <div key={index} className={styles.sliderItem}>
                <Image
                    fill
                    //src={`/images${ensureLeadingSlash(dir)}/${normalizePath(image)}`}
                    src={`/api/dynamic-thumbnail?img=${image}`}
                    // src={`${normalizePath(image)}`}
                    alt="Image"
                    className={styles.image} />
            </div>
            {/* <div className={styles.photoName}>{path.parse(normalizePath(image)).name}</div> */}
            <div className={styles.photoName}>{path.basename(normalizePath(image))}</div>
        </div>
    )
});

