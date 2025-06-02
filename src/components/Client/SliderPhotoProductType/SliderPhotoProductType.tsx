'use client';

import { memo, useState } from 'react';
import Slider from 'react-slick';
import styles from './SliderPhotoProductType.module.scss';
import Image from 'next/image';
import PrevIcon from '@/assets/icons/arrow-prev-svgrepo-com.svg';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { CustomArrow } from '../UI/CustomArrow/CustomArrow';
import { SlideTypeProduct } from './SlideTypeProduct/SlideTypeProduct';

const normalizePath = (p) => p.replace(/\\/g, '/');

interface SliderPhotoProductTypeProps {

    activeSlide: number | null;
    images: string[];
    toggleSelect?: (image: string, select: boolean) => void;
    checkSelectPhoto?: (element: any) => boolean;
    selectPhotos: string[];
    dir: string;
    switchSelectePhoto: (image: string) => void;
}

export const SliderPhotoProductType = memo(({ activeSlide, images, dir, switchSelectePhoto }: SliderPhotoProductTypeProps) => {

    const settings = {
        dots: false,
        infinite: images.length > 1,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: activeSlide,
        afterChange: (current: number) => {
            const currentImage = images[current];
            switchSelectePhoto(normalizePath(currentImage));
        },
        prevArrow: (
            <CustomArrow >
                <div className={`${styles.wrapperArrow} ${styles.arrowPrev}`}>
                    <Image src={PrevIcon} alt={'Prev'} ></Image>
                </div>
            </CustomArrow>

        ),
        nextArrow: (
            <CustomArrow>
                <div className={`${styles.wrapperArrow} ${styles.arrowNext}`}>
                    <Image src={PrevIcon} alt={'Next'}></Image>
                </div>
            </CustomArrow>

        ),
    };

    if (!open || activeSlide === null) return null;
    return (
        <div className={styles.SliderPhotoProductType}>
            <div className={styles.wrapperBox}>
                <Slider {...settings} className={styles.slider}>
                    {images.map((image, index) => (
                        <SlideTypeProduct index={index} image={image} dir={dir} key={index} />
                    ))}
                </Slider>
            </div>

        </div>
    )
});

