'use client';
import { memo } from 'react';
import styles from './KeyboardNumbers.module.scss';
import { BtnKeyboard } from '../Client/UI/BtnKeyboard/BtnKeyboard';
const btns = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '0', 'delete'];
export const KeyboardNumbers = memo(({ onKeyPress }) => {
    return (<div className={styles.KeyboardNumbers}>
                {btns.map((btn, index) => (<BtnKeyboard value={btn} key={index} onClick={() => onKeyPress(btn)}/>))}
            </div>);
});
//# sourceMappingURL=KeyboardNumbers.jsx.map