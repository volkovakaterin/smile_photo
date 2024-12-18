'use client'

import React, { useEffect, useState } from 'react';
import '@/styles/globals.scss';
import { Inter } from '@/assets/fonts/fonts';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { OrderProvider, TYPE_MODE, useOrder } from '@/providers/OrderProvider';
import useIdle from '@/hooks/trackInactivity';
import { TheModal } from '@/components/Client/TheModal/TheModal';
import { ButtonSecondary } from '@/components/Client/UI/ButtonSecondary/ButtonSecondary';
import { usePathname, useRouter } from 'next/navigation';


const queryClient = new QueryClient();

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const [showModal, setShowModal] = useState(false);
  const { resetOrder, orderId, mode } = useOrder();
  const [idleEnabled, setIdleEnabled] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // useEffect(() => {
  //   if (!pathname) return;
  //   if (pathname.includes('/super-admin')) {
  //     console.log(pathname, 'адрес страницы')
  //     setIdleEnabled(false);
  //   } else {
  //     setIdleEnabled(true);
  //   }
  // }, [pathname]);

  // const action = () => {
  //   if (orderId) {
  //     setShowModal(true);
  //   }
  //   else {
  //     console.log('на домашнюю из action')
  //     router.push(`/`)
  //   }
  // };

  // Время бездействия 60 секунд, вызываем action, когда пользователь неактивен
  // useIdle({
  //   timeout: idleEnabled ? 60000 : 0,
  //   action: idleEnabled ? action : undefined,
  // });

  // useEffect(() => {
  //   let timer: NodeJS.Timeout | null = null;

  //   if (showModal) {
  //     timer = setTimeout(() => {
  //       resetOrder();
  //       setShowModal(false);
  //       console.log('на домашнюю из эффекта');
  //       router.push(`/`);
  //     }, 30000);
  //   }


  //   return () => {
  //     console.log('clearTimeout');
  //     if (timer) clearTimeout(timer);
  //   };
  // }, [showModal, resetOrder]);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>

      {showModal && (
        <TheModal open={showModal} handleClose={() => setShowModal(false)} width={800}>
          <h3 style={{ marginTop: '50px', textAlign: 'center' }}>
            {mode == TYPE_MODE.CREAT ? `Хотите продолжить оформление заказа?` : `Хотите продолжить редактирование заказа?`}
          </h3>
          <div
            style={{
              display: 'flex',
              gap: '50px',
              alignItems: 'center',
              marginTop: '50px',
              justifyContent: 'center',
            }}
          >
            <ButtonSecondary text="Продолжить" onClick={() => setShowModal(false)} />
            <ButtonSecondary
              text="Начать новый заказ"
              onClick={() => {
                resetOrder();
                setShowModal(false);
              }}
            />
          </div>
        </TheModal>
      )}
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head></head>
      <body className={`${Inter.variable}`}>
        <OrderProvider>
          <RootLayoutContent>{children}</RootLayoutContent>
        </OrderProvider>
      </body>
    </html>
  );
}

