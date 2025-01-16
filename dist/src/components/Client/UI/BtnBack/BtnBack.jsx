'use client';
import { memo } from 'react';
import styles from './BtnBack.module.scss';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Arrow from '../../../../assets/icons/Arrow_icon.svg';
export const BtnBack = memo(() => {
    const router = useRouter();
    return (<button onClick={() => router.back()} type='button' className={styles.BtnBack}>
                <div className={styles.wrapperArrow}>
                    <Image src={Arrow} alt={'arrow'} width={22} height={20}/>
                </div>
                <span className={styles.text}>Назад</span>
            </button>);
});
//# sourceMappingURL=BtnBack.jsx.map