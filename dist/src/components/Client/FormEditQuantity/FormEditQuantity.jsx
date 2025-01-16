'use client';
import { memo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import styles from './FormEditQuantity.module.scss';
import { ButtonSecondary } from '../UI/ButtonSecondary/ButtonSecondary';
export const FormEditQuantity = memo(({ onClose, quantity, confirmChange }) => {
    const { control, handleSubmit, setValue, formState: { errors }, } = useForm({
        defaultValues: {
            quantity: quantity
        },
        mode: 'onChange',
    });
    const changeQuantity = (type) => {
        const currentQuantity = control._formValues.quantity || 0;
        const newQuantity = type === 'increment' ? currentQuantity + 1 : Math.max(currentQuantity - 1, 1);
        setValue('quantity', newQuantity);
    };
    const onSubmit = (formData) => {
        onClose();
        confirmChange(formData);
    };
    return (<form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className={styles.FormEditQuantity}>
            <h4 className={styles.title}>Кол-во копий</h4>
            <div className={styles.wrapperСounter}>
                <button type='button' className={styles.btnMinus} onClick={() => changeQuantity('decrement')}>-</button>
                <Controller name='quantity' control={control} render={({ field }) => (<div className={styles.quantity}>
                            {field.value ?? 0}
                        </div>)}/>
                <button type='button' className={styles.btnPlus} onClick={() => changeQuantity('increment')}>+</button>
            </div>
            <div className={styles.wrapperBtn}>
                <ButtonSecondary text='Подтвердить' type='submit' width={352} onClick={() => onSubmit(control._formValues)}/>
            </div>
        </form>);
});
//# sourceMappingURL=FormEditQuantity.jsx.map