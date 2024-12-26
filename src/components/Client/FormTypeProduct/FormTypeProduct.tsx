'use client';

import { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import styles from './FormTypeProduct.module.scss';
import { ButtonSecondary } from '../UI/ButtonSecondary/ButtonSecondary';
import { ManageFormat } from './ManageFormat/ManageFormat';

export type Product = {
    product: string,
    label: string,
    quantity: number,
    done: boolean,
    id: string,
    copies: COPIES
}

enum FORMAT {
    ELECTRONIC = 'electronic',
    PRINTED = 'printed'
}

enum COPIES {
    MANY = 'many_copies',
    SINGLE = 'single_copy'
}

export interface FormTypeProductProps {
    onClose: () => void;
    confirmFn: (formData: FormData) => void;
    error: boolean;
    products: { id: string, name: string, format: FORMAT, copies: COPIES }[];
    selectProducts: Product[] | null;
    selectPhoto: string | null;
    selectFormatForAll: (id: string, value: boolean, name: string) => void;
    formatForAll: { id: string, label: string }[];
}

export type FormData = Record<
    string,
    { quantity: number; name: string; many_copies: COPIES }
>;

export const FormTypeProduct = ({ onClose, confirmFn, error, products, selectProducts, selectPhoto, selectFormatForAll, formatForAll }: FormTypeProductProps) => {
    const [initialValues, setInitialValues] = useState<FormData>();
    const [handleAction, setHandleAction] = useState(false);

    useEffect(() => {
        const newValues = products.reduce<FormData>((acc, product) => {
            acc[product.id] = { quantity: 0, name: product.name, many_copies: product.copies };
            return acc;
        }, {});

        if (selectProducts) {
            selectProducts.forEach((selectedProduct) => {
                if (newValues[selectedProduct.product]) {
                    newValues[selectedProduct.product] = {
                        quantity: selectedProduct.quantity,
                        name: selectedProduct.label,
                        many_copies: newValues[selectedProduct.product].many_copies,
                    };
                }
            });
        }
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
            reset(initialValues);
        }
    }, [initialValues, reset]);

    const formValues = watch();


    const handleChange = (id, value, name) => {
        selectFormatForAll(id, value, name)
    }

    const changeQuantity = (type: 'increment' | 'decrement', field) => {
        const currentQuantity = formValues[field]?.quantity || 0;
        let newQuantity = currentQuantity;
        if (formValues[field]?.many_copies === COPIES.MANY) {
            newQuantity = type === 'increment' ? currentQuantity + 1 : Math.max(currentQuantity - 1, 0);
        } else {
            newQuantity = type === 'increment' ? 1 : 0;
        }

        setValue(field, {
            ...formValues[field],
            quantity: newQuantity,
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
                <div className={styles.wrapperTitle}>
                    <h4 className={styles.title}>Печать фото:</h4>
                    <span>Применить формат ко всем выбранным фото</span>
                </div>
                <div className={styles.checkboxes}>
                    {products.map((item, index) => {
                        if (item.format !== FORMAT.PRINTED) {
                            return null;
                        }
                        return (
                            <Controller
                                key={index}
                                name={item.id as keyof FormData}
                                control={control}
                                render={({ field }) => (
                                    <ManageFormat handleChange={handleChange}
                                        changeQuantity={changeQuantity} index={index}
                                        item={item} valueQuantity={field.value?.quantity}
                                        valueFormatAll={formatForAll.some(el => el.id == item.id)}
                                    />
                                )}
                            />
                        );
                    })}
                    {products.map((item, index) => {
                        if (item.format == FORMAT.ELECTRONIC) {
                            return (
                                <Controller
                                    key={index}
                                    name={item.id as keyof FormData}
                                    control={control}
                                    render={({ field }) => (
                                        <ManageFormat changeQuantity={changeQuantity}
                                            handleChange={handleChange} index={index}
                                            item={item} valueQuantity={field.value?.quantity}
                                            valueFormatAll={formatForAll.some(el => el.id == item.id)}
                                            bold={true} />
                                    )}
                                />
                            )
                        }

                    })}
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

