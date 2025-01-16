'use client';
import styles from './ManageFormat.module.scss';
import CheckboxCustom from '../../UI/Checkbox/Checkbox';
export const ManageFormat = ({ changeQuantity, index, item, valueQuantity, bold, handleChange, valueFormatAll }) => {
    return (<label className={styles.Label} key={index}>
            <span className={`${styles.labelCheckbox} ${bold && styles.bold}`}>{item.name}</span>
            <div className={styles.wrapperManage}>
                <div className={styles.wrapperBtn}>
                    <button type="button" className={styles.btnMinus} onClick={() => changeQuantity('decrement', item.id)}>
                        -
                    </button>
                    <div className={styles.quantity}>
                        {valueQuantity ?? 0}
                    </div>
                    <button type="button" className={styles.btnPlus} onClick={() => changeQuantity('increment', item.id)}>
                        +
                    </button>
                </div>
                <CheckboxCustom id={item.id} value={valueFormatAll} onToggle={(id, value) => handleChange(id, value, item.name)}/>
            </div>
        </label>);
};
//# sourceMappingURL=ManageFormat.jsx.map