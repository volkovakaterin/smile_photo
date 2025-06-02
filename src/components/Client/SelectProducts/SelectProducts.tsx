'use client';

import { memo, useEffect, useState } from 'react';
import { MenuItem, FormControl, Select, Checkbox, ListItemText, OutlinedInput, SelectChangeEvent } from '@mui/material';
import styles from './SelectProducts.module.scss';
import { Product as SelectProduct } from '../OrdersTable/OrdersTable';

type Product = {
    id: string,
    name: string,
    format: string,
    copies: string
}

interface SelectProductsProps {
    products: Product[];
    onSelectionChange: (value: { name: string; id: string | undefined }) => void;
    selectProducts?: SelectProduct[];
}

export const SelectProducts = memo(({ products, onSelectionChange, selectProducts }: SelectProductsProps) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    useEffect(() => {
        if (selectProducts) {
            const arr = selectProducts.map((item) => { return item.label })
            setSelectedIds(arr);
        }
    }, [selectProducts])

    const handleChange = (event: SelectChangeEvent<string[]>) => {
        const selected = event.target.value as string[];
        const newSelections = selected.filter((item) => !selectedIds.includes(item));
        if (newSelections.length > 0) {
            const productId = products.find(item => item.name === newSelections[0]);
            onSelectionChange({ name: newSelections[0], id: productId?.id });
        }
    };

    return (
        <FormControl fullWidth className={styles.SelectProducts}>
            <div className={styles.labelSelect}>Выбрать товары</div>
            <Select
                labelId="multi-select-label"
                multiple
                value={selectedIds}
                onChange={handleChange}
                input={<OutlinedInput label="Выберите товары" />}
                renderValue={() => null}
            >
                {products.map((product) => (
                    <MenuItem key={product.name} value={product.name}>
                        <Checkbox checked={selectedIds.includes(product.name)} />
                        <ListItemText primary={product.name} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
});