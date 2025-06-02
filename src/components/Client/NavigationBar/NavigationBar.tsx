'use client';

import { FC, memo } from 'react';
import styles from './NavigationBar.module.scss';
import { BtnBasket } from '../UI/BtnBasket/BtnBasket';
import { BtnBack } from '../UI/BtnBack/BtnBack';
import Basket from '@/assets/icons/icon_shopcart_orange.svg'

import { Button } from '../UI/Button/Button';
import { BtnContent } from '../UI/BtnContent/BtnContent';


interface NavigationBarProps {
    basket?: boolean;
    totalQuantity?: number;
    navigationBack?: () => void;
    navigationExit?: () => void;
    handleClick?: () => void;
    btnExit?: boolean;
    btnBack?: boolean;
    btnSelectAll?: boolean;
}
export const NavigationBar: FC<NavigationBarProps> = memo(
    ({ basket, totalQuantity, navigationBack, btnExit, btnBack, btnSelectAll, navigationExit, handleClick }) => {

        return (
            <div className={styles.NavigationBar}>
                <div className={styles.wrapperGo}>
                    {btnExit ? <Button navigationTo={navigationExit} btnText={'Выход'} /> : false}
                    {btnBack ? <BtnBack navigationBack={navigationBack} btnText={'Назад'} /> : false}
                    {btnSelectAll ? <BtnContent handleClick={handleClick} btnIcon={Basket} btnText={'Выбрать все'} /> : false}
                </div>
                {basket && (<BtnBasket totalQuantity={totalQuantity ?? 0} />)}
            </div >
        );
    }
);