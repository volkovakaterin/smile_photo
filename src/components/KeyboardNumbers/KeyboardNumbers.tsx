'use client';

import { FC, memo } from 'react';
import styles from './KeyboardNumbers.module.scss';
import { BtnKeyboard } from '../Client/UI/BtnKeyboard/BtnKeyboard';

const btns = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '0', 'delete']

interface KeyboardNumbersProps {
    onKeyPress: (key: string) => void;
}
export const KeyboardNumbers: FC<KeyboardNumbersProps> = memo(
    ({ onKeyPress }) => {
        return (
            <div className={styles.KeyboardNumbers}>
                {btns.map((btn, index) => (
                    <BtnKeyboard value={btn} key={index} onClick={() => onKeyPress(btn)} />
                ))}
            </div>
        );
    }
);