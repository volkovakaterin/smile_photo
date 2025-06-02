'use client'
import React, { useState, useEffect } from 'react';
import { useOrders } from '@/hooks/Order/useGetOrders';
import FilterByStatus from '@/components/Client/FilterOrders/FilterOrders';
import OrdersTable from '@/components/Client/OrdersTable/OrdersTable';
import styles from './style.module.scss';
import { useOrder } from '@/providers/OrderProvider';
import { useCleaner } from '@/providers/Cleaner';
import { Dialog, DialogActions, DialogTitle, DialogContent, Button, Pagination, Stack } from '@mui/material';




export type SuperAdminType = {}


const SuperAdmin = () => {
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [page, setPage] = useState(1)
  const rowsPerPage = 50
  const { orders, refetch } = useOrders(filterStatus, undefined, page, rowsPerPage);
  const [loading, setLoading] = useState(false);
  const [loadingMonitoring, setLoadingMonitoring] = useState(false);
  const [loadingCleaner, setLoadingCleaner] = useState(false);
  const [message, setMessage] = useState('');
  const { directories } = useOrder();
  const { period } = useCleaner();
  const [open, setOpen] = useState(false)

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleMonitoring = async () => {
    setLoadingMonitoring(true);
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/monitoring-folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ directoryPath: directories.photos })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Функция выполнена успешно: ' + data.result);
      } else {
        setMessage('Ошибка: ' + data.message);
      }
    } catch (error) {
      setMessage('Ошибка при отправке запроса');
    } finally {
      setLoadingMonitoring(false);
      setLoading(false);
    }
  };

  const handleCleaner = async () => {
    setLoadingCleaner(true);
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/process-cleaner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ directoryPath: directories.photos, period: period })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Функция выполнена успешно: ' + data.result);
        await refetch();
      } else {
        setMessage('Ошибка: ' + data.message);
      }
    } catch (error) {
      setMessage('Ошибка при отправке запроса');
    } finally {
      setLoadingCleaner(false);
      setLoading(false);
    }
  };

  return (
    <div>
      <div className={styles.wrapperButtonSetting}>
        <button className={styles.startMonitoring} disabled={loading} onClick={() => {
          handleMonitoring()
        }}>
          {loadingMonitoring ? 'Загрузка...' : 'Обновить папки'}</button>
        <button className={styles.startCleaner} disabled={loading} onClick={() => {
          if (period) {
            handleOpen()
          } else alert("Период не задан")
        }}>{loadingCleaner ? 'Загрузка...' : 'Запустить удаление'}</button>
      </div>
      <h4>Все заказы</h4>
      <FilterByStatus currentStatus={filterStatus} onStatusChange={(sts) => { setPage(1); setFilterStatus(sts); }} />
      {orders &&
        <><OrdersTable orders={orders.docs} ordersTotal={orders.totalDocs} /><Stack spacing={2} alignItems="center" marginTop={2}>
          <Pagination
            count={orders.totalPages ?? Math.ceil((orders.totalDocs || 0) / rowsPerPage)}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            showFirstButton
            showLastButton />
        </Stack></>}
      <Dialog open={open}
        onClose={handleClose}
        aria-labelledby="simple-dialog-title">
        <DialogTitle id="simple-dialog-title">
          {`Хотите навсегда удалить заказы старше ${period} дней?`}
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button onClick={() => {
            handleClose();
            handleCleaner();
          }}>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SuperAdmin;
