'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { InputPhone, TYPE_INPUT } from '@/components/Client/UI/InputPhone/InputPhone';
import styles from './FormSearchOrder.module.scss';
import { KeyboardNumbers } from '@/components/KeyboardNumbers/KeyboardNumbers';
import { useOrderCreateMode } from '@/providers/OrderCreateMode';
import Loupe from '@/assets/icons/loupe.svg';
import Image from 'next/image';

export type FormData = {
    phone: string;
    nameFolder: string;
};

type FormSearchOrderProps = {
    onSearch: (orderName: { phone?: string; nameFolder?: string; }) => void;
    orderName: { phone?: string; nameFolder?: string } | null;
};

const FormSearchOrder = ({ onSearch, orderName }: FormSearchOrderProps) => {
    const {
        handleSubmit,
        control,
        formState: { errors },
        getValues,
        watch,
        setValue,
    } = useForm<FormData>({
        defaultValues: {
            phone: '',
            nameFolder: '',
        },
    });

    const { orderCreateMode } = useOrderCreateMode();

    const [orderNameExistsError, setOrderNameExistsError] = React.useState<string | null>(null);
    const [showKeyboard, setShowKeyboard] = React.useState(orderName ? false : true);

    const handleKeyboardPress = (key: string) => {
        const fieldName = orderCreateMode === 'create_order_number' ? 'phone' : 'nameFolder';
        const currentValue = watch(fieldName) || (fieldName === 'phone' ? '+7' : '');

        if (key === '+') return;

        if (key === 'delete') {
            setValue(fieldName, currentValue.slice(0, -1));
        } else {
            setValue(fieldName, currentValue + key);
        }
    };

    useEffect(() => {
        if (orderName) {
            if (orderCreateMode === 'create_order_number') {
                setValue('phone', orderName.phone || '');
            } else {
                setValue('nameFolder', orderName.nameFolder || '');
            }
        }
    }, [orderName, setValue, orderCreateMode]);

    const onSubmit = (data: FormData) => {
        setShowKeyboard(false);

        if (orderCreateMode === 'create_order_number') {
            const phone = data.phone?.trim().replace(/\s+/g, '');
            if (phone) onSearch({ phone: phone });
        } else {
            const name = data.nameFolder?.trim();
            if (name) onSearch({ nameFolder: name });
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.FormSearchOrder}>
                {orderCreateMode === 'create_order_number' ? (
                    <Controller
                        name="phone"
                        control={control}
                        rules={{ required: 'Введите номер телефона' }}
                        render={({ field, fieldState }) => (
                            <InputPhone
                                onFocus={() => setShowKeyboard(true)}
                                onSearch={() => onSubmit(getValues())}
                                field={field}
                                fieldState={fieldState}
                                errors={errors}
                                setPhoneExistsError={setOrderNameExistsError}
                                phoneExistsError={orderNameExistsError}
                                type={TYPE_INPUT.SEARCH}
                                width={444}
                            />
                        )}
                    />
                ) : (
                    <Controller
                        name="nameFolder"
                        control={control}
                        rules={{ required: 'Введите номер заказа' }}
                        render={({ field, fieldState }) => (
                            <div className={styles.InputWrapper}>
                                <div className={styles.telWrapper} style={{ width: `444px` }}>
                                    <input
                                        type="number"
                                        className={styles.Input}
                                        {...field}
                                        onFocus={() => setShowKeyboard(true)}
                                    />
                                    <div className={styles.wrapperArrow} onClick={() => onSubmit(getValues())}>
                                        <Image src={Loupe} alt={'arrow'}
                                            width={22} height={20} />
                                    </div>
                                </div>

                            </div>
                        )}
                    />
                )}
            </form>

            <div className={styles.keyboardWrapper}>
                <div className={`${styles.keyboard} ${showKeyboard ? styles.show : ''}`}>
                    <KeyboardNumbers onKeyPress={handleKeyboardPress} />
                </div>
            </div>
        </div>
    );
};

export default FormSearchOrder;
