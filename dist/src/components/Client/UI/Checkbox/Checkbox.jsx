'use client';
import styles from './Checkbox.module.scss';
import Mark from '@/assets/icons/check-mark-svgrepo-com.svg';
import Image from 'next/image';
export default function CheckboxCustom({ id, label, onToggle, value }) {
    const handleChecked = () => {
        if (onToggle) {
            onToggle(id, !value);
        }
    };
    return (<div className={styles.CheckboxCustom}>
            <input type="checkbox" checked={value} onChange={handleChecked} id={id}/>
            <label htmlFor={id} className={value ? styles.checked : styles.empty}>
                {label}
                <span className={styles.box}>
                    <Image alt='Да' src={Mark} className={`${styles.mark} ${value ? styles.visible : false}`}>
                    </Image>
                </span>
            </label>
        </div>);
}
//# sourceMappingURL=Checkbox.jsx.map