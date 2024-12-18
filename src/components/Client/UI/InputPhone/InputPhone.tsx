'use client';

import { ReactNode, memo, useState } from 'react';
import { Controller, ControllerFieldState, ControllerRenderProps, FieldErrors, useForm } from 'react-hook-form';
import Image from 'next/image';
import styles from './InputPhone.module.scss';
import Arrow from '@/assets/icons/Arrow_white.svg';
import Loupe from '@/assets/icons/loupe.svg';
import { FormData } from '../../FormCreateOrder/FormCreateOrder';
import { MuiTelInput, matchIsValidTel } from 'mui-tel-input';

export enum TYPE_INPUT {
    SEARCH = 'search',
    CREAT = 'create'
}

interface InputPhoneProps {
    field: ControllerRenderProps<FormData, 'phone'>;
    fieldState: ControllerFieldState;
    errors: FieldErrors;
    setPhoneExistsError: (value: null) => void;
    phoneExistsError: string | null;
    type: string;
    width?: number;
    onSearch?: () => void;
    onFocus?: () => void;
}



export const InputPhone = memo(({ field, fieldState, errors, setPhoneExistsError,
    phoneExistsError, type, width, onSearch, onFocus }: InputPhoneProps) => {


    return (
        <div className={styles.InputPhone} >
            <div className={styles.telWrapper} style={{ width: width ? `${width}px` : undefined }}>
                <MuiTelInput
                    {...field}
                    className={styles.telInput}
                    defaultCountry="RU"
                    helperText={
                        fieldState.invalid
                            ? String(errors.phone?.message || '')
                            : undefined
                    }
                    error={fieldState.invalid}
                    onChange={(value) => {
                        field.onChange(value);
                        setPhoneExistsError(null);
                    }}
                    onFocus={onFocus}
                />
                {type == TYPE_INPUT.SEARCH ? (
                    <div className={styles.wrapperArrow} onClick={onSearch}>
                        <Image src={Loupe} alt={'arrow'}
                            width={22} height={20} />
                    </div>
                ) : false}
            </div>
            {phoneExistsError && <span className={styles.errorText}>{phoneExistsError}</span>}
        </div>

    );
});

