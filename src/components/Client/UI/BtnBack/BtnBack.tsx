'use client';

import { FC, ReactNode, memo } from 'react';
import styles from './BtnBack.module.scss';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Arrow from '../../../../assets/icons/Arrow_icon.svg';


interface BtnBackProps {
    navigationBack?: () => void;
    btnText?: string;
}
export const BtnBack: FC<BtnBackProps> = memo(
    ({ navigationBack, btnText }) => {
        const router = useRouter();
        return (
            <button onClick={() => { navigationBack ? navigationBack() : false }} type='button' className={styles.BtnBack}>
                <div className={styles.wrapperArrow}>
                    <Image src={Arrow} alt={'arrow'} width={22} height={20} />
                </div>
                <span className={styles.text}>{btnText ? btnText : `Назад`}</span>
            </button>
        );
    }
);