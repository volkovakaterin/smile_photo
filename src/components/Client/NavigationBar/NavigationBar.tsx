'use client';

import { FC, memo } from 'react';
import styles from './NavigationBar.module.scss';
import { BtnBasket } from '../UI/BtnBasket/BtnBasket';
import { BtnBack } from '../UI/BtnBack/BtnBack';


interface NavigationBarProps {
    basket?: boolean;
    totalQuantity?: number;
}
export const NavigationBar: FC<NavigationBarProps> = memo(
    ({ basket, totalQuantity }) => {
        return (
            <div className={styles.NavigationBar}>
                <BtnBack />
                {basket && (<BtnBasket totalQuantity={totalQuantity ?? 0} />)}
            </div>
        );
    }
);