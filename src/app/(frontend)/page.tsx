"use client"

import { ButtonSecondary } from '@/components/Client/UI/ButtonSecondary/ButtonSecondary';
import styles from './style.module.scss';
import { useOrder } from '@/providers/OrderProvider';
import { useRouter } from 'next/navigation';



export default function HomePage() {
    const { setBasketProducts, setQuantityProducts, setOrderId } = useOrder();
    const router = useRouter();

    const reset = () => {
        setBasketProducts(null);
        setQuantityProducts(0);
        setOrderId(null)
    }

    const goSearchPhoto = () => {
        reset();
        router.push(`/search-photo`);

    }

    const goEditOrder = () => {
        reset();
        router.push(`/search-order`);

    }
    return (

        <div className={styles.HomePage}>
            <h2 className={styles.title}>Ваши фото здесь</h2>
            <div className={styles.wrapperManage}>
                <ButtonSecondary text='Найти фото' width={444} onClick={() => goSearchPhoto()} />
                <ButtonSecondary text='Редактировать заказ' width={444} onClick={() => goEditOrder()} />
            </div>
        </div>
    );
}
