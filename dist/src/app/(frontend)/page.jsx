"use client";
import { ButtonSecondary } from '@/components/Client/UI/ButtonSecondary/ButtonSecondary';
import styles from './style.module.scss';
import { useOrder } from '@/providers/OrderProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
export default function HomePage() {
    const { resetOrder } = useOrder();
    const router = useRouter();
    useEffect(() => {
        resetOrder();
    }, []);
    const goSearchPhoto = () => {
        router.push(`/search-photo`);
    };
    const goEditOrder = () => {
        router.push(`/search-order`);
    };
    return (<div className={styles.HomePage}>
            <h2 className={styles.title}>Ваши фото здесь</h2>
            <div className={styles.wrapperManage}>
                <ButtonSecondary text='Найти фото' width={444} onClick={() => goSearchPhoto()}/>
                <ButtonSecondary text='Редактировать заказ' width={444} onClick={() => goEditOrder()}/>
            </div>
        </div>);
}
//# sourceMappingURL=page.jsx.map