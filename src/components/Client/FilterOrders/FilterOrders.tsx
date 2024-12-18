import React from "react";
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import style from './FilterOrders.module.scss'

type FilterByStatusProps = {
    currentStatus: string | undefined;
    onStatusChange: (status: string | undefined) => void;
};

const FilterByStatus: React.FC<FilterByStatusProps> = ({ currentStatus, onStatusChange }) => {

    const handleChange = (event: SelectChangeEvent) => {
        if (event.target.value == '') {
            onStatusChange(undefined);
        } else { onStatusChange(event.target.value) };
    };

    return (
        <FormControl sx={{ minWidth: 200 }} size="small" className={style.FilterOrders}>
            <InputLabel id="status-filter-label">Фильтр по статусу</InputLabel>
            <Select
                labelId="status-filter-label"
                value={currentStatus ?? ''}
                onChange={handleChange}
                label="Filter by Status"
            >
                <MenuItem value="">Все</MenuItem>
                <MenuItem value="open">Открыт</MenuItem>
                <MenuItem value="created">Подтвержден</MenuItem>
                <MenuItem value="closed">Закрыт</MenuItem>
                <MenuItem value="paid">Оплачен</MenuItem>
            </Select>
        </FormControl>
    );
};

export default FilterByStatus;
