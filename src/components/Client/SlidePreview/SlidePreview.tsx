'use client';

import { memo, useEffect, useRef, useState } from 'react';
import styles from './SlidePreview.module.scss';
import Image from 'next/image';
import path from 'path';
import { ButtonWithContent } from '../UI/ButtonWithContent/ButtonWithContent';
import Delete from '@/assets/icons/icon_trash.svg';
import Basket from '@/assets/icons/icon_shop_white.svg';

interface SlidePreviewProps {
    toggleSelect?: (image: string, select: boolean, index: number) => void;
    index: number;
    image: string;
    checkSelectPhoto?: (element: any) => boolean;
    selectPhotos: string[];
    dir: string;
}

export const SlidePreview = memo(({ toggleSelect, index, image, checkSelectPhoto, selectPhotos, dir }: SlidePreviewProps) => {
    const [btnParams, setBtnParams] = useState({ icon: Basket, backgroundColor: '#F4B45C' });
    const [select, setSelect] = useState(false);

    useEffect(() => {
        if (checkSelectPhoto)
            setSelect(checkSelectPhoto(image));
    }, [image, selectPhotos])


    useEffect(() => {
        if (select) {
            setBtnParams({ icon: Delete, backgroundColor: '#fff' })
        } else { setBtnParams({ icon: Basket, backgroundColor: '#F4B45C' }) }
    }, [select])

    return (
        <div className={styles.SlidePreview}>
            <div key={index} className={styles.sliderItem}>
                <Image
                    fill
                    style={{ top: '40px' }}
                    src={`/images${dir}/${image}`}
                    alt="Image"
                    className={styles.image} />
            </div>
            <div className={styles.photoName}>{path.parse(image).name}</div>
            {toggleSelect && (<div className={styles.wrapperBtn} onClick={() => toggleSelect(image, select, index)}>
                <ButtonWithContent icon={btnParams.icon} backgroundColor={btnParams.backgroundColor}
                    width={68} height={68} widthIcon={42} heightIcon={38}
                />
            </div>)}
        </div>
    )
});

