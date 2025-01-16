'use client';
import { memo } from 'react';
import Image from 'next/image';
import styles from './InputPhone.module.scss';
import Loupe from '@/assets/icons/loupe.svg';
import { MuiTelInput } from 'mui-tel-input';
export var TYPE_INPUT;
(function (TYPE_INPUT) {
    TYPE_INPUT["SEARCH"] = "search";
    TYPE_INPUT["CREAT"] = "create";
})(TYPE_INPUT || (TYPE_INPUT = {}));
export const InputPhone = memo(({ field, fieldState, errors, setPhoneExistsError, phoneExistsError, type, width, onSearch, onFocus }) => {
    return (<div className={styles.InputPhone}>
            <div className={styles.telWrapper} style={{ width: width ? `${width}px` : undefined }}>
                <MuiTelInput {...field} className={styles.telInput} defaultCountry="RU" helperText={fieldState.invalid
            ? String(errors.phone?.message || '')
            : undefined} error={fieldState.invalid} onChange={(value) => {
            field.onChange(value);
            setPhoneExistsError(null);
        }} onFocus={onFocus}/>
                {type == TYPE_INPUT.SEARCH ? (<div className={styles.wrapperArrow} onClick={onSearch}>
                        <Image src={Loupe} alt={'arrow'} width={22} height={20}/>
                    </div>) : false}
            </div>
            {phoneExistsError && <span className={styles.errorText}>{phoneExistsError}</span>}
        </div>);
});
//# sourceMappingURL=InputPhone.jsx.map