'use client';
import { memo, useEffect, useRef, useState } from 'react';
import styles from './SlidePreview.module.scss';
import path from 'path';
import { ButtonWithContent } from '../UI/ButtonWithContent/ButtonWithContent';
import Delete from '@/assets/icons/icon_trash.svg';
import Basket from '@/assets/icons/icon_shop_white.svg';
import { Watermark } from "antd";
const normalizePath = (p) => p.replace(/\\/g, '/');
const ensureLeadingSlash = (p) => (p.startsWith('/') ? p : `/${p}`);
export const SlidePreview = memo(({ toggleSelect, index, image, checkSelectPhoto, selectPhotos, dir }) => {
    const [btnParams, setBtnParams] = useState({ icon: Basket, backgroundColor: '#F4B45C' });
    const [select, setSelect] = useState(false);
    const [imageSize, setImageSize] = useState(null);
    const imgRef = useRef(null);
    const [normalizeImage, setNormalizeImage] = useState('');
    const handleImageLoad = (index) => {
        if (imgRef.current) {
            const width = imgRef.current?.offsetWidth;
            const height = imgRef.current?.offsetHeight;
            setImageSize({ width, height });
        }
    };
    useEffect(() => {
        setNormalizeImage(normalizePath(image));
        if (checkSelectPhoto)
            setSelect(checkSelectPhoto(normalizePath(image)));
    }, [image, selectPhotos]);
    useEffect(() => {
        if (select) {
            setBtnParams({ icon: Delete, backgroundColor: '#fff' });
        }
        else {
            setBtnParams({ icon: Basket, backgroundColor: '#F4B45C' });
        }
    }, [select]);
    return (<div className={styles.SlidePreview}>
            <Watermark style={{
            width: imageSize ? `${imageSize.width}px` : '100%',
            height: imageSize ? `${imageSize.height}px` : '100%',
        }} content={"Не оплачено"} font={{ color: 'rgba(104, 106, 107, 0.4)', fontSize: 60, fontWeight: 700 }} gap={[100, 150]} width={400} rotate={0}>
                <div key={index} className={styles.sliderItem}>
                    <img className={styles.image} style={{ height: '100%', objectFit: 'contain' }} ref={imgRef} src={`/images${ensureLeadingSlash(dir)}/${normalizeImage}`} alt="Image" onLoad={() => handleImageLoad(index)}/>
                </div>
            </Watermark>
            <div className={styles.photoName}>{path.parse(normalizeImage).name}</div>
            {toggleSelect && (<div className={styles.wrapperBtn} onClick={() => toggleSelect(normalizeImage, select, index)}>
                <ButtonWithContent icon={btnParams.icon} backgroundColor={btnParams.backgroundColor} width={68} height={68} widthIcon={42} heightIcon={38}/>
            </div>)}
        </div>);
});
//# sourceMappingURL=SlidePreview.jsx.map