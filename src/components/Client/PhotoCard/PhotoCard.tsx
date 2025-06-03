'use client';

import { memo, useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './PhotoCard.module.scss';
import { ButtonWithContent } from '../UI/ButtonWithContent/ButtonWithContent';
import Delete from '@/assets/icons/icon_trash.svg';
import Basket from '@/assets/icons/icon_shop_white.svg';
import PrintWhite from '@/assets/icons/printer-white.svg';
import PrintBlack from '@/assets/icons/printer-black.svg';
import Edit from '@/assets/icons/edit-3.svg';
import path from 'path';
import { useFunctionalMode } from '@/providers/FunctionalMode';

export type ImageType = {
    image: string; id: string;
}

interface PhotoCardProps {
    image: string;
    onClick?: (index) => void;
    index: number;
    toggleSelect: (image: string, select: boolean, index: number) => void;
    togglePrint?: (image: string, select: boolean) => void;
    checkSelectPhoto: (element: any) => boolean;
    checkPrintPhoto: (element: any) => boolean;
    selectPhotos: string[];
    fromBasket?: boolean;
    onOpen?: () => void;
    quantity?: number;
    dir: string;
    openPreviewModal?: (image: string) => void;
    printFromBasket?: boolean;
}

const normalizePath = (p) => p.replace(/\\/g, '/');
const ensureLeadingSlash = (p: string) => (p.startsWith('/') ? p : `/${p}`);

export const PhotoCard = memo(({ image, onClick, index, toggleSelect, checkSelectPhoto, selectPhotos,
    fromBasket, onOpen, quantity, openPreviewModal, togglePrint, checkPrintPhoto, printFromBasket }: PhotoCardProps) => {
    const [btnParams, setBtnParams] = useState<{ icon: string, backgroundColor: string } | undefined>(undefined);
    const [printParams, setPrintParams] = useState<{ icon: string, backgroundColor: string } | undefined>(undefined);
    const [select, setSelect] = useState(false);
    const [print, setPrint] = useState(false);
    const [normalizeImage, setNormalizeImage] = useState('');
    const { mode } = useFunctionalMode();

    useEffect(() => {
        console.log(image, "картинка карточки")
        const normalizeImage = normalizePath(image);

        setSelect(checkSelectPhoto(normalizeImage));
        if (!fromBasket) {
            setPrint(checkPrintPhoto(normalizeImage));
        }
        setNormalizeImage(normalizeImage);
    }, [image, selectPhotos])

    useEffect(() => {
        if (select || fromBasket) {
            setBtnParams({ icon: Delete, backgroundColor: '#fff' })
        } else { setBtnParams({ icon: Basket, backgroundColor: '#F4B45C' }) }
    }, [select])

    useEffect(() => {
        const isActive = fromBasket ? printFromBasket : print;

        setPrintParams({
            icon: isActive ? PrintWhite : PrintBlack,
            backgroundColor: isActive ? '#56c456' : '#fff',
        });
    }, [print, printFromBasket, fromBasket])

    return (
        <div style={{ paddingTop: `${!fromBasket ? '30px' : false}` }}>
            <div className={styles.PhotoCard}>
                {(fromBasket && quantity != null && quantity > 0) && (<span className={styles.quantity} onClick={onOpen}>{quantity}</span>)}
                {normalizeImage ? <Image
                    unoptimized={true}
                    src={`/api/dynamic-thumbnail?img=${normalizeImage}`}
                    fill alt={'photo'} onClick={
                        () => {
                            fromBasket ? (openPreviewModal && openPreviewModal(normalizeImage)) : (onClick && onClick(index))
                        }}
                    className={styles.image} /> : null}

                {!fromBasket && (<div className={styles.statusBox} onClick={() => toggleSelect(normalizeImage, select, index)} ><span className={`${styles.statusMark} ${select ? styles.visible : false}`}>
                </span>
                </div>)}
                {mode !== 'with_formats' && (<div className={styles.wrapperbtnPrint}>
                    <ButtonWithContent icon={printParams && (printParams.icon)} backgroundColor={printParams && (printParams.backgroundColor)}
                        onClick={() => togglePrint?.(normalizeImage, select)} />
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