'use client';
import React from 'react';
import styles from './SuccessOrder.module.scss';
import Link from 'next/link';
import { ButtonSecondary } from '@/components/Client/UI/ButtonSecondary/ButtonSecondary';
const SuccessOrder = ({ title, tel_number }) => {
    return (<div>
            <div className={styles.SuccessOrder}>
                <h2 className={styles.title}>{title}</h2>
                <h3 className={styles.title}>Номер заказа : {tel_number}</h3>
                <span className={styles.text}>Обратитесь к администратору чтобы оплатить его</span>
                <Link className={styles.wrapperBtn} href={'/'}>
                    <ButtonSecondary text='Вернуться на главный экран' width={559}/></Link>
            </div>
        </div>);
};
export default SuccessOrder;
//# sourceMappingURL=SuccessOrder.jsx.map