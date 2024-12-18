'use client';

import { FC, ReactNode, memo } from 'react';
import styles from './BtnKeyboard.module.scss';
import Image from 'next/image';
import Delete from '@/assets/icons/delete-left-svgrepo-com.svg';

interface BtnKeyboardProps {
    value: string;
    onClick: () => void;
}
export const BtnKeyboard: FC<BtnKeyboardProps> = memo(
    ({ value, onClick }) => {
        return (
            <button onClick={onClick} type='button' className={styles.BtnKeyboard}>
                {value == 'delete' ? (<Image src={Delete} alt={'delete'}></Image>) : (<span className={styles.text}>{value}</span>)}
            </button>
        );
    }
);