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
}

export const PhotoCard = memo(({ image, onClick, index, toggleSelect, checkSelectPhoto, selectPhotos, fromBasket, onOpen, quantity, dir }: PhotoCardProps) => {
    const [btnParams, setBtnParams] = useState<{ icon: string, backgroundColor: string } | undefined>(undefined);
    const [select, setSelect] = useState(false);

    useEffect(() => {
        setSelect(checkSelectPhoto(image));
    }, [image, selectPhotos])

    useEffect(() => {
        if (select || fromBasket) {
            setBtnParams({ icon: Delete, backgroundColor: '#fff' })
        } else { setBtnParams({ icon: Basket, backgroundColor: '#F4B45C' }) }
    }, [select])



    return (
        <div style={{ paddingTop: '30px' }}>
            <div className={styles.PhotoCard}>
                {fromBasket && (<span className={styles.quantity} onClick={onOpen}>{quantity}</span>)}
                <Image
                    src={`/images${dir}/${image}`}
                    fill alt={'photo'} onClick={() => { onClick && (onClick(index)) }} className={styles.image} />
                {!fromBasket && (<div className={styles.statusBox}><span className={`${styles.statusMark} ${select ? styles.visible : false}`}></span></div>)}
                <div className={styles.wrapperBtn}
                >
                    {fromBasket && (<ButtonWithContent icon={Edit} backgroundColor={'#fff'} onClick={onOpen} />)}
                    <ButtonWithContent icon={btnParams && (btnParams.icon)} backgroundColor={btnParams && (btnParams.backgroundColor)}
                        onClick={() => toggleSelect(image, select, index)} />
                </div>
            </div>
            <div className={styles.photoName}>{path.parse(image).name}</div>
        </div>
    );
});