'use client';

import { FC, memo } from 'react';
import styles from './Button.module.scss';

interface Btn {
    navigationTo?: () => void;
    btnText?: string;
}
export const Button: FC<Btn> = memo(
    ({ navigationTo, btnText }) => {

        return (
            <button onClick={() => { navigationTo ? navigationTo() : false }} type='button' className={styles.Btn}>
                <span className={styles.text}>{btnText}</span>
            </button>
        );
    }
);