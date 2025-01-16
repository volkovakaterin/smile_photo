'use client';
import { memo } from 'react';
import cn from 'classnames';
import styles from './ButtonSecondary.module.scss';
import Arrow from '../../../../assets/icons/Arrow_icon.svg';
import Image from 'next/image';
export const ButtonSecondary = memo(({ text, width, onClick, className, type = 'button', disabled = false }) => {
    return (<button onClick={onClick} disabled={disabled} type={type} className={cn([styles.ButtonSecondary, className])} style={{ width: width ? `${width}px` : 'auto' }}>
                <span className={styles.text}>{text}</span>

                <div className={styles.wrapperArrow}>
                    <Image src={Arrow} alt={'arrow'} width={22} height={20}/>
                </div>
            </button>);
});
//# sourceMappingURL=ButtonSecondary.jsx.map