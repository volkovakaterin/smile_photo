'use client';

import { memo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import styles from './FormCreateOrder.module.scss';
import { matchIsValidTel } from 'mui-tel-input';
import { InputPhone, TYPE_INPUT } from '../UI/InputPhone/InputPhone';
import { ButtonSecondary } from '../UI/ButtonSecondary/ButtonSecondary';
import { KeyboardNumbers } from '@/components/KeyboardNumbers/KeyboardNumbers';

interface FormCreateOrderProps {
    confirmFn: (formData: FormData) => void;
    error: boolean;
}

export type FormData = {
    phone: string;
};

export const FormCreateOrder = memo(({ confirmFn, error }: FormCreateOrderProps) => {
    const [phoneExistsError, setPhoneExistsError] = useState<string | null>(null);
    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
        watch,
    } = useForm<FormData>({
        defaultValues: {
            phone: '',
        },
        mode: 'onChange',
    });

    const handleKeyboardPress = (key: string) => {
        const currentValue = watch('phone') || '+7';
        if (key === '+') return;
        if (key === 'delete') {
            setValue('phone', currentValue.slice(0, -1));
        } else {
            setValue('phone', currentValue + key);
        }
    };


    const onSubmit = (formData: FormData) => {
        if (confirmFn)
            confirmFn(formData);
    };
    if (!error)
        return (
            <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className={styles.FormCreateOrder}>
                <h4 className={styles.title}>Введите ваш номер телефона. Он будет являться номером заказа</h4>
                <div className={styles.inputs}>
                    <label className={styles.telLabel}>
                        <Controller
                            name="phone"
                            control={control}
                            // rules={{
                            //     validate: matchIsValidTel as any,
                            // }}
                            render={({ field, fieldState }) => (
                                <InputPhone field={field} fieldState={fieldState} errors={errors}
                                    setPhoneExistsError={setPhoneExistsError}
                                    phoneExistsError={phoneExistsError} type={TYPE_INPUT.CREAT} />
                            )}
                        />
                    </label>
                </div>
                <KeyboardNumbers onKeyPress={handleKeyboardPress} />
                <ButtonSecondary text='Подтвердить' type='submit' width={352} />
            </form>
        );
    else if (error) {
        return (
            <div>Ошибка при открытии заказа</div>
        )
    }
});

