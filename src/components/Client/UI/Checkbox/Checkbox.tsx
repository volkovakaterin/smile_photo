'use client';
import { useState } from 'react';
import styles from './Checkbox.module.scss';

interface CheckboxProps {
    id: string;
    label?: string;
    onToggle?: (key: string, newState: boolean) => void;
    value: boolean;
    classNameString?: string
}

export default function CheckboxCustom({ id, label, onToggle, value }: CheckboxProps) {
    const handleChecked = () => {
        if (onToggle) {
            onToggle(id, !value);
        }
    };

    return (
        <div className={styles.CheckboxCustom}>
            <input type="checkbox" checked={value} onChange={handleChecked} id={id} />
            <label htmlFor={id} className={value ? styles.checked : styles.empty}>
                {label}
                <span className={styles.box}><span className={styles.mark}></span></span>
            </label>
        </div>
    );
}
