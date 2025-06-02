import React from "react";
import style from './FilterOrders.module.scss'

type FilterByStatusProps = {
    currentStatus: string[];
    onStatusChange: (status: string[]) => void;
};

const FilterByStatus: React.FC<FilterByStatusProps> = ({ currentStatus, onStatusChange }) => {
    const changeActiveStatus = (status) => {
        if (currentStatus.includes(status)) {
            onStatusChange(currentStatus.filter(s => s !== status))
        } else {
            onStatusChange([...currentStatus, status])

        }
    }

    return (
        <div className={style.FilterOrders}>
            <button onClick={() => changeActiveStatus('open')}
                className={`${style.button} ${style.button_open} ${currentStatus.includes('open') ? style.active : false}`}>Открыт</button>
            <button onClick={() => changeActiveStatus('created')}
                className={`${style.button} ${style.button_created} ${currentStatus.includes('created') ? style.active : false}`}>Подтвержден</button>
            <button onClick={() => changeActiveStatus('paid')}
                className={`${style.button} ${style.button_paid} ${currentStatus.includes('paid') ? style.active : false}`}>Оплачен</button>
            <button onClick={() => changeActiveStatus('closed')}
                className={`${style.button} ${style.button_closed} ${currentStatus.includes('closed') ? style.active : false}`}>Закрыт</button>

        </div>
    );
};

export default FilterByStatus;
