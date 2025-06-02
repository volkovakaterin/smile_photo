'use client';

import { FC, ReactNode, memo } from 'react';
import styles from './BtnContent.module.scss';
import Image from 'next/image';
import { useRouter } from 'next/navigation';



interface BtnContentProps {
    handleClick?: () => void;
    btnText: string;
    btnIcon: string;
}
export const BtnContent: FC<BtnContentProps> = memo(
    ({ handleClick, btnText, btnIcon }) => {
        const router = useRouter();
        return (
            <button onClick={() => { handleClick ? handleClick() : false }} type='button' className={styles.BtnContent}>
                <div className={styles.wrapperIcon}>
                    <Image src={btnIcon} alt={'arrow'} width={22} height={22} />
                </div>
                <span className={styles.text}>{btnText}</span>
            </button>
        );
    }
);