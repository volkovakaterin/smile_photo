'use client';

import { FC, memo } from 'react';
import styles from './BtnIcon.module.scss';
import Image from 'next/image';
import { useRouter } from 'next/navigation';



interface BtnIconProps {
    handleClick?: () => void;
    btnIcon: string;
}
export const BtnIcon: FC<BtnIconProps> = memo(
    ({ handleClick, btnIcon }) => {
        const router = useRouter();
        return (
            <button onClick={() => { handleClick ? handleClick() : false }} type='button' className={styles.BtnIcon}>
                <div className={styles.wrapperIcon}>
                    <Image src={btnIcon} alt={'arrow'} width={23} height={23} />
                </div>
            </button>
        );
    }
);