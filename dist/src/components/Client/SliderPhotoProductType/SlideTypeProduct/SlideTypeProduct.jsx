'use client';
import { memo } from 'react';
import styles from './SlideTypeProduct.module.scss';
import Image from 'next/image';
import path from 'path';
const normalizePath = (p) => p.replace(/\\/g, '/');
const ensureLeadingSlash = (p) => (p.startsWith('/') ? p : `/${p}`);
export const SlideTypeProduct = memo(({ index, image, dir }) => {
    return (<div className={styles.SlideTypeProduct}>
            <div key={index} className={styles.sliderItem}>
                <Image fill src={`/images${ensureLeadingSlash(dir)}/${normalizePath(image)}`} alt="Image" className={styles.image}/>
            </div>
            <div className={styles.photoName}>{path.parse(normalizePath(image)).name}</div>
        </div>);
});
//# sourceMappingURL=SlideTypeProduct.jsx.map