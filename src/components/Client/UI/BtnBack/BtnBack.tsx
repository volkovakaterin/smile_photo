'use client';

import { FC, ReactNode, memo } from 'react';
import styles from './BtnBack.module.scss';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Arrow from '../../../../assets/icons/Arrow_icon.svg';


interface BtnBackProps {

}
export const BtnBack: FC<BtnBackProps> = memo(
    () => {
        const router = useRouter();
        return (
            <button onClick={() => router.back()} type='button' className={styles.BtnBack}>
                <div className={styles.wrapperArrow}>
                    <Image src={Arrow} alt={'arrow'} width={22} height={20} />
                </div>
                <span className={styles.text}>Назад</span>
            </button>
        );
    }
);