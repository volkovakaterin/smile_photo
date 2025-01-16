'use client';
import { memo, useEffect, useState } from 'react';
import { MenuItem, FormControl, Select, Checkbox, ListItemText, OutlinedInput } from '@mui/material';
import styles from './SelectProducts.module.scss';
export const SelectProducts = memo(({ products, onSelectionChange, selectProducts }) => {
    const [selectedIds, setSelectedIds] = useState([]);
    useEffect(() => {
        if (selectProducts) {
            const arr = selectProducts.map((item) => { return item.label; });
            setSelectedIds(arr);
        }
    }, [selectProducts]);
    const handleChange = (event) => {
        const selected = event.target.value;
        const newSelections = selected.filter((item) => !selectedIds.includes(item));
        if (newSelections.length > 0) {
            const productId = products.find(item => item.name === newSelections[0]);
            onSelectionChange({ name: newSelections[0], id: productId?.id });
        }
    };
    return (<FormControl fullWidth className={styles.SelectProducts}>
            <div className={styles.labelSelect}>Выберите товары</div>
            <Select labelId="multi-select-label" multiple value={selectedIds} onChange={handleChange} input={<OutlinedInput label="Выберите товары"/>} renderValue={() => null}>
                {products.map((product) => (<MenuItem key={product.name} value={product.name}>
                        <Checkbox checked={selectedIds.includes(product.name)}/>
                        <ListItemText primary={product.name}/>
                    </MenuItem>))}
            </Select>
        </FormControl>);
});
//# sourceMappingURL=SelectProducts.jsx.map