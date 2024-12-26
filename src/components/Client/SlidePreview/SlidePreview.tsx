'use client';

import { memo, useEffect, useRef, useState } from 'react';
import styles from './SlidePreview.module.scss';
import path from 'path';
import { ButtonWithContent } from '../UI/ButtonWithContent/ButtonWithContent';
import Delete from '@/assets/icons/icon_trash.svg';
import Basket from '@/assets/icons/icon_shop_white.svg';
import { Watermark } from "antd";


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
    const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);

    const handleImageLoad = (index: number) => {
        if (imgRef.current) {
            const width = imgRef.current?.offsetWidth;
            const height = imgRef.current?.offsetHeight;
            setImageSize({ width, height });
        }
    };


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
            <Watermark
                style={{
                    width: imageSize ? `${imageSize.width}px` : '100%',
                    height: imageSize ? `${imageSize.height}px` : '100%',
                }}
                content={"Не оплачено"}
                font={{ color: 'rgba(104, 106, 107, 0.4)', fontSize: 60, fontWeight: 700 }}
                gap={[100, 150]}
                width={400}
                rotate={0}
            >
                <div key={index} className={styles.sliderItem}>
                    <img
                        className={styles.image}
                        style={{ height: '100%', objectFit: 'contain' }}
                        ref={imgRef}
                        src={`/images${dir}/${image}`}
                        alt="Image"
                        onLoad={() => handleImageLoad(index)}
                    />
                </div>
            </Watermark>
            <div className={styles.photoName}>{path.parse(image).name}</div>
            {toggleSelect && (<div className={styles.wrapperBtn} onClick={() => toggleSelect(image, select, index)}>
                <ButtonWithContent icon={btnParams.icon} backgroundColor={btnParams.backgroundColor}
                    width={68} height={68} widthIcon={42} heightIcon={38}
                />
            </div>)}
        </div>
    )
});

