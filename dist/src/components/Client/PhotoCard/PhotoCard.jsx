'use client';
import { memo, useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './PhotoCard.module.scss';
import { ButtonWithContent } from '../UI/ButtonWithContent/ButtonWithContent';
import Delete from '@/assets/icons/icon_trash.svg';
import Basket from '@/assets/icons/icon_shop_white.svg';
import Edit from '@/assets/icons/edit-3.svg';
import path from 'path';
const normalizePath = (p) => p.replace(/\\/g, '/');
const ensureLeadingSlash = (p) => (p.startsWith('/') ? p : `/${p}`);
export const PhotoCard = memo(({ image, onClick, index, toggleSelect, checkSelectPhoto, selectPhotos, fromBasket, onOpen, quantity, dir, openPreviewModal }) => {
    const [btnParams, setBtnParams] = useState(undefined);
    const [select, setSelect] = useState(false);
    const [normalizeImage, setNormalizeImage] = useState('');
    useEffect(() => {
        setSelect(checkSelectPhoto(normalizePath(image)));
        setNormalizeImage(normalizePath(image));
    }, [image, selectPhotos]);
    useEffect(() => {
        if (select || fromBasket) {
            setBtnParams({ icon: Delete, backgroundColor: '#fff' });
        }
        else {
            setBtnParams({ icon: Basket, backgroundColor: '#F4B45C' });
        }
    }, [select]);
    return (<div style={{ paddingTop: `${!fromBasket ? '30px' : false}` }}>
            <div className={styles.PhotoCard}>
                {(fromBasket && quantity != null && quantity > 0) && (<span className={styles.quantity} onClick={onOpen}>{quantity}</span>)}
                <Image src={`/images${ensureLeadingSlash(dir)}/${normalizeImage}`} fill alt={'photo'} onClick={() => { fromBasket ? (openPreviewModal && openPreviewModal(normalizeImage)) : (onClick && onClick(index)); }} className={styles.image}/>
                {!fromBasket && (<div className={styles.statusBox}><span className={`${styles.statusMark} ${select ? styles.visible : false}`}></span></div>)}
                <div className={styles.wrapperBtn}>
                    {(fromBasket && onOpen) && (<ButtonWithContent icon={Edit} backgroundColor={'#fff'} onClick={onOpen}/>)}
                    <ButtonWithContent icon={btnParams && (btnParams.icon)} backgroundColor={btnParams && (btnParams.backgroundColor)} onClick={() => toggleSelect(normalizeImage, select, index)}/>
                </div>
            </div>
            <div className={styles.photoName}>{path.parse(normalizeImage).name}</div>
        </div>);
});
//# sourceMappingURL=PhotoCard.jsx.map