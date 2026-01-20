'use client';

import { memo, useEffect, useMemo, useState } from 'react';
import Slider, { CustomArrowProps } from 'react-slick';
import styles from './PreviewPhoto.module.scss';
import Image from 'next/image';
import PrevIcon from '@/assets/icons/Arrow_prev.svg';
import NextIcon from '@/assets/icons/Arrow_next.svg';
import CloseIcon from '../../../assets/icons/close.svg';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { SlidePreview } from '../SlidePreview/SlidePreview';
import { CustomArrow } from '../UI/CustomArrow/CustomArrow';
import { Watermark } from 'antd';
import { ButtonWithContent } from '../UI/ButtonWithContent/ButtonWithContent';
import Delete from '@/assets/icons/icon_trash.svg';
import Basket from '@/assets/icons/icon_shop_white.svg';

type ImageItem = { path: string; mtimeMs?: number };
type RefreshMap = Record<string, number>;

const normalizePath = (p: unknown) => String(p ?? '').replace(/\\/g, '/');

interface PreviewPhotoProps {
    open: boolean;
    handleClose?: () => void;
    activeSlide: number | null;
    images: ImageItem[];
    toggleSelect?: (image: string, select: boolean, index: number) => void;
    checkSelectPhoto?: (element: any) => boolean;
    fromBasket?: boolean;
    refreshMap?: RefreshMap;
    basketVisitId?: number;
}

const PrevArrow = (props: CustomArrowProps) => {
    const { currentSlide, onClick } = props;
    const isHidden = currentSlide === 0;

    return (
        <CustomArrow onClick={onClick}>
            <div className={`${styles.wrapperArrow} ${styles.arrowPrev} ${isHidden ? styles.hidden : ''}`}>
                <Image src={PrevIcon} alt="Prev" />
            </div>
        </CustomArrow>
    );
};

const NextArrow = (props: CustomArrowProps) => {
    const { currentSlide, slideCount, onClick } = props;
    const isHidden = slideCount !== undefined && currentSlide === (slideCount - 1);

    return (
        <CustomArrow onClick={onClick}>
            <div className={`${styles.wrapperArrow} ${styles.arrowNext} ${isHidden ? styles.hidden : ''}`}>
                <Image src={NextIcon} alt="Next" />
            </div>
        </CustomArrow>
    );
};

export const PreviewPhoto = memo(
    ({ open, handleClose, activeSlide, images, toggleSelect, checkSelectPhoto, fromBasket, refreshMap, basketVisitId }: PreviewPhotoProps) => {
        const [currentSlide, setCurrentSlide] = useState<number>(activeSlide ?? 0);

        const safeCurrentSlide = useMemo(() => {
            if (!images?.length) return 0;
            const idx = currentSlide ?? 0;
            return Math.min(Math.max(idx, 0), images.length - 1);
        }, [currentSlide, images?.length]);

        // ⚠️ важное: initialSlide у react-slick учитывается только при первом маунте
        // поэтому делаем key на Slider по activeSlide, чтобы он пересоздавался при открытии
        const sliderKey = `${open ? 1 : 0}-${activeSlide ?? 0}-${images?.length ?? 0}`;

        const settings = {
            lazyLoad: 'ondemand' as const,
            dots: false,
            infinite: false,
            speed: 300,
            slidesToShow: 1,
            slidesToScroll: 1,
            initialSlide: safeCurrentSlide,
            afterChange: (newIndex: number) => setCurrentSlide(newIndex),
            prevArrow: <PrevArrow />,
            nextArrow: <NextArrow />,
        };

        useEffect(() => {
            if (activeSlide !== null) setCurrentSlide(activeSlide);
        }, [activeSlide]);

        if (!open || activeSlide === null) return null;

        return (
            <div className={styles.PreviewPhoto}>
                <div className={styles.wrapperBox}>
                    {handleClose && (
                        <div className={styles.wrapperClose} onClick={handleClose}>
                            <Image src={CloseIcon} alt="close" width={20} height={20} />
                        </div>
                    )}

                    <Watermark
                        style={{ width: '100%', height: '100%' }}
                        content={'Не оплачено'}
                        font={{ color: 'rgba(104, 106, 107, 0.4)', fontSize: 60, fontWeight: 700 }}
                        gap={[100, 150]}
                        width={400}
                        rotate={0}
                    >
                        <Slider key={sliderKey} {...settings} className={styles.slider}>
                            {images?.map((item, index) => {
                                // ✅ НЕ decodeURIComponent — иначе ключи могут разъехаться
                                const normalizedPath = normalizePath(item.path);
                                const refreshToken = refreshMap?.[normalizedPath];

                                // ✅ ключ включает refreshToken => слайд перемонтируется при обновлении
                                const slideKey = `${normalizedPath}-${item.mtimeMs ?? 0}-${refreshToken ?? 0}-${index}`;

                                return (
                                    <div key={slideKey} className={styles.slideWrapper}>
                                        <SlidePreview
                                            image={normalizedPath}
                                            mtimeMs={item.mtimeMs}
                                            fromBasket={fromBasket}
                                            basketVisitId={basketVisitId}
                                        />
                                    </div>
                                );
                            })}
                        </Slider>
                    </Watermark>

                    <div className={styles.buttonsWrapper}>
                        {(() => {
                            const cur = images?.[safeCurrentSlide];
                            if (!cur) return null;

                            const normalized = normalizePath(cur.path);
                            const isSelected = checkSelectPhoto?.(normalized) ?? true;

                            return (
                                <div className={styles.wrapperBtn} onClick={() => toggleSelect?.(normalized, isSelected, safeCurrentSlide)}>
                                    <ButtonWithContent
                                        icon={isSelected ? Delete : Basket}
                                        backgroundColor={isSelected ? '#fff' : '#F4B45C'}
                                        width={68}
                                        height={68}
                                        widthIcon={42}
                                        heightIcon={38}
                                    />
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>
        );
    }
);
