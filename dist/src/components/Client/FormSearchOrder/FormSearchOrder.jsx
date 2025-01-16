'use client';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { InputPhone, TYPE_INPUT } from '@/components/Client/UI/InputPhone/InputPhone';
import styles from './FormSearchOrder.module.scss';
import { KeyboardNumbers } from '@/components/KeyboardNumbers/KeyboardNumbers';
const FormSearchOrder = ({ onSearchByPhone }) => {
    const { handleSubmit, control, formState: { errors }, getValues, watch, setValue, } = useForm({
        defaultValues: { phone: '' },
    });
    const [phoneExistsError, setPhoneExistsError] = React.useState(null);
    const [showKeyboard, setShowKeyboard] = React.useState(true);
    const handleKeyboardPress = (key) => {
        const currentValue = watch('phone') || '+7';
        if (key === '+')
            return;
        if (key === 'delete') {
            setValue('phone', currentValue.slice(0, -1));
        }
        else {
            setValue('phone', currentValue + key);
        }
    };
    const onSubmit = (data) => {
        setShowKeyboard(false);
        onSearchByPhone(data.phone);
    };
    return (<div>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.FormSearchOrder}>
                <Controller name="phone" control={control} rules={{
            required: 'Введите номер телефона',
            validate: (value) => value.startsWith('+7') || 'Номер должен начинаться с +7',
        }} render={({ field, fieldState }) => (<InputPhone onFocus={() => setShowKeyboard(true)} onSearch={() => onSubmit(getValues())} field={field} fieldState={fieldState} errors={errors} setPhoneExistsError={setPhoneExistsError} phoneExistsError={phoneExistsError} type={TYPE_INPUT.SEARCH} width={444}/>)}/>
            </form>
            <div className={styles.keyboardWrapper}>
                <div className={`${styles.keyboard} ${showKeyboard ? styles.show : false}`}>
                    <KeyboardNumbers onKeyPress={handleKeyboardPress}/>
                </div>
            </div>
        </div>);
};
export default FormSearchOrder;
//# sourceMappingURL=FormSearchOrder.jsx.map