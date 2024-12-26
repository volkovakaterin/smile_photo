'use client';

import { memo } from 'react';
import Slider from 'react-slick';
import styles from './PreviewPhoto.module.scss';
import Image from 'next/image';
import PrevIcon from '@/assets/icons/Arrow_prev.svg';
import NextIcon from '@/assets/icons/Arrow_next.svg';
import CloseIcon from '../../../assets/icons/close.svg';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { SlidePreview } from '../SlidePreview/SlidePreview';
import { CustomArrow } from '../UI/CustomArrow/CustomArrow';


interface PreviewPhotoProps {
    open: boolean;
    handleClose?: () => void;
    activeSlide: number | null;
    images: string[];
    toggleSelect?: (image: string, select: boolean, index: number) => void;
    checkSelectPhoto?: (element: any) => boolean;
    selectPhotos: string[];
    dir: string;
}

export const PreviewPhoto = memo(({ open, handleClose, activeSlide, images, toggleSelect, checkSelectPhoto, selectPhotos, dir }: PreviewPhotoProps) => {
    const settings = {
        dots: false,
        infinite: images.length > 1,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: activeSlide,
        prevArrow: (
            <CustomArrow>
                <div className={`${styles.wrapperArrow} ${styles.arrowPrev}`}>
                    <Image src={PrevIcon} alt={'Prev'} ></Image>
                </div>
            </CustomArrow>

        ),
        nextArrow: (
            <CustomArrow>
                <div className={`${styles.wrapperArrow} ${styles.arrowNext}`}>
                    <Image src={NextIcon} alt={'Next'}></Image>
                </div>
            </CustomArrow>

        ),
    };

    if (!open || activeSlide === null) return null;
    return (
        <div className={styles.PreviewPhoto}>
            <div className={styles.wrapperBox}>
                {handleClose && (<div className={styles.wrapperClose} onClick={handleClose}>
                    <Image src={CloseIcon} alt={'close'} width={20} height={20} />
                </div>)}
                <Slider {...settings} className={styles.slider}>
                    {images.map((image, index) => (
                        <SlidePreview key={index} image={image} selectPhotos={selectPhotos}
                            toggleSelect={toggleSelect} index={index}
                            checkSelectPhoto={checkSelectPhoto} dir={dir} />
                    ))}
                </Slider>
            </div>

        </div>
    )
});

