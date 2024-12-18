'use client';

import { FC, memo } from 'react';
import styles from './BtnBasket.module.scss';
import Image from 'next/image';
import Basket from '@/assets/icons/icon_shopcart.svg'
import Link from 'next/link';
import { useOrder } from '@/providers/OrderProvider';

interface BtnBasketProps {
    totalQuantity: number;
}

export const BtnBasket: FC<BtnBasketProps> = memo(
    ({ totalQuantity }) => {
        const { mode } = useOrder();
        const href = mode === 'create' ? '/basket' : '/edit-order';
        return (
            <Link href={href}> <button type='button' className={styles.BtnBasket}>
                <Image src={Basket} width={55} height={50} alt={'Корзина'}></Image>
                <span className={styles.quantity}>{totalQuantity}</span>
            </button></Link>
        );
    }
);