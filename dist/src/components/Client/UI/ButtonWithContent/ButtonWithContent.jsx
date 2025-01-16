'use client';
import { memo } from 'react';
import styles from './ButtonWithContent.module.scss';
import Image from 'next/image';
export const ButtonWithContent = memo(({ text, width, onClick, type = 'button', disabled = false, icon, backgroundColor, height, widthIcon, heightIcon }) => {
    return (<button onClick={onClick} disabled={disabled} type={type} className={styles.ButtonWithContent} style={{ width: width ? `${width}px` : '46px', height: height ? `${height}px` : '46px', backgroundColor: `${backgroundColor}` }}>
                {icon && (<Image src={icon} alt={'btn'} style={{ width: widthIcon ? `${widthIcon}px` : '28px', height: heightIcon ? `${heightIcon}px` : '26px' }}></Image>)}
                <span className={styles.text}>{text}</span>
            </button>);
});
//# sourceMappingURL=ButtonWithContent.jsx.map