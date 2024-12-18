'use client';

import { memo, useMemo, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import styles from './FormTypeProduct.module.scss';
import { ButtonSecondary } from '../UI/ButtonSecondary/ButtonSecondary';
import Link from 'next/link';
import CheckboxCustom from '../UI/Checkbox/Checkbox';

export type Product = {
    product: string,
    label: string,
    quantity: number,
    done: boolean,
    id: string
}

export interface FormTypeProductProps {
    onClose: () => void;
    confirmFn: (formData: FormData) => void;
    error: boolean;
    products: { id: string, name: string }[];
    selectProducts: Product[] | null;
    selectPhoto: string | null;
}

export type FormData = Record<
    string,
    { select: boolean; quantity: number; name: string }
>;

export const FormTypeProduct = ({ onClose, confirmFn, error, products, selectProducts, selectPhoto }: FormTypeProductProps) => {
    const [initialValues, setInitialValues] = useState<FormData>();
    const [handleAction, setHandleAction] = useState(false);

    useEffect(() => {
        console.log(selectProducts)
        console.log(selectPhoto)
        const newValues = products.reduce<FormData>((acc, product) => {
            acc[product.id] = { select: false, quantity: 0, name: product.name };
            return acc;
        }, {});

        console.log(newValues)

        if (selectProducts) {
            selectProducts.forEach((selectedProduct) => {
                if (newValues[selectedProduct.product]) {
                    newValues[selectedProduct.product] = {
                        select: true,
                        quantity: selectedProduct.quantity,
                        name: selectedProduct.label,
                    };
                }
            });
        }
        console.log(newValues, 'новый вальюсы')
        setInitialValues(newValues);
    }, [products, selectProducts, selectPhoto]);

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: {},
        mode: 'onChange',
    });

    useEffect(() => {
        if (initialValues) {
            reset(initialValues); // Устанавливаем значения формы
        }
    }, [initialValues, reset]);

    const formValues = watch();

    const handleChange = (key, value) => {
        if (value) {
            setValue(key as keyof FormData, { ...formValues[key], select: value, quantity: 1 });
        } else setValue(key as keyof FormData, { ...formValues[key], select: value, quantity: 0 });
        setHandleAction(true);
    }

    const changeQuantity = (type: 'increment' | 'decrement', field) => {
        const currentQuantity = formValues[field]?.quantity || 0;
        const newQuantity = type === 'increment' ? currentQuantity + 1 : Math.max(currentQuantity - 1, 1);
        setValue(field, {
            ...formValues[field],
            quantity: newQuantity
        });
        setHandleAction(true);
    };

    useEffect(() => {
        if (handleAction) {
            confirmFn(formValues);
            setHandleAction(false);
        }

    }, [handleAction])

    const onSubmit = (formData: FormData) => {
        onClose();
    };

    if (!error)
        return (
            <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className={styles.FormTypeProduct}>
                <h4 className={styles.title}>Печать фото:</h4>
                <div className={styles.checkboxes}>
                    {products.map((item, index) => (
                        <Controller
                            key={index}
                            name={item.id as keyof FormData}
                            control={control}
                            render={({ field }) => (
                                <label className={styles.Label} key={index}>
                                    <span className={styles.labelCheckbox}>{item.name}</span>
                                    <div className={styles.wrapperManage}>
                                        <div className={`${styles.wrapperBtn} ${formValues[item.id]?.select ? styles.visible : ''}`}>
                                            <button type='button' className={styles.btnMinus}
                                                onClick={() => changeQuantity('decrement', item.id)}>-</button>
                                            <div className={styles.quantity}>
                                                {field.value?.quantity ?? 0}
                                            </div>
                                            <button type='button' className={styles.btnPlus} onClick={() => changeQuantity('increment', item.id)}>+</button>
                                        </div>
                                        <CheckboxCustom
                                            id={item.id}
                                            value={field.value?.select ?? false}
                                            onToggle={handleChange}
                                        />

                                    </div>

                                </label>
                            )}
                        />
                    ))}
                </div>
                <div className={styles.btnLink}>
                    <ButtonSecondary text='Подтвердить' width={352} type='submit'
                        onClick={() => onSubmit(formValues as FormData)} />
                </div>
            </form>
        );
    else if (error) {
        return (
            <div>Ошибка при добавлении фото в корзину</div>
        )
    }
};

