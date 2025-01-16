'use client';
import { memo } from 'react';
import styles from './NavigationBar.module.scss';
import { BtnBasket } from '../UI/BtnBasket/BtnBasket';
import { BtnBack } from '../UI/BtnBack/BtnBack';
export const NavigationBar = memo(({ basket, totalQuantity }) => {
    return (<div className={styles.NavigationBar}>
                <BtnBack />
                {basket && (<BtnBasket totalQuantity={totalQuantity ?? 0}/>)}
            </div>);
});
//# sourceMappingURL=NavigationBar.jsx.map