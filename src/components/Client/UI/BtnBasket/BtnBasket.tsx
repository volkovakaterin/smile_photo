'use client';

import { FC, memo, useEffect } from 'react';
import styles from './BtnBasket.module.scss';
import Image from 'next/image';
import Basket from '@/assets/icons/icon_shopcart.svg'
import Link from 'next/link';
import { useOrder } from '@/providers/OrderProvider';
import { useRouter } from 'next/navigation';

interface BtnBasketProps {
    totalQuantity: number;
}

export const BtnBasket: FC<BtnBasketProps> = memo(({ totalQuantity }) => {
    const { mode } = useOrder();
    const href = mode === 'create' ? '/basket' : '/edit-order';
    const router = useRouter();

    useEffect(() => {
        router.prefetch(href);
    }, [href, router]);

    return (
        <Link href={href} className={styles.BtnBasket} aria-label="Корзина">
            <Image src={Basket} width={55} height={50} alt="Корзина" />
            <span className={styles.quantity} aria-live="polite">{totalQuantity}</span>
        </Link>
    );
});

