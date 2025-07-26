'use client'

import React from 'react';
import '@/styles/globals.scss';
import { Inter } from '@/assets/fonts/fonts';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { OrderProvider, TYPE_MODE, useOrder } from '@/providers/OrderProvider';
import { TheModal } from '@/components/Client/TheModal/TheModal';
import { ButtonSecondary } from '@/components/Client/UI/ButtonSecondary/ButtonSecondary';
import { useRouter } from 'next/navigation';
import { FunctionalModeProvider } from '@/providers/FunctionalMode';
import { SearchByPhoneProvider } from '@/providers/SearchByPhone';
import { ShowModalGlobalProvider, useShowModalGlobal } from '@/providers/ShowModal';
import { CleanerProvider } from '@/providers/Cleaner';
import { OrderCreateModeProvider } from '@/providers/OrderCreateMode';


const queryClient = new QueryClient();

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { showModalGlobal, setShowModalGlobal } = useShowModalGlobal();
  const { resetOrder, mode } = useOrder();
  const router = useRouter();

  return (
    <>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>

      {showModalGlobal && (
        <TheModal open={showModalGlobal} handleClose={() => setShowModalGlobal(false)} width={800}>
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
            <ButtonSecondary text="Продолжить" onClick={() => setShowModalGlobal(false)} />
            <ButtonSecondary
              text="Вернуться в главное меню"
              onClick={() => {
                resetOrder();
                setShowModalGlobal(false);
                router.push(`/`)
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
        <OrderCreateModeProvider>
          <FunctionalModeProvider>
            <CleanerProvider>
              <OrderProvider>
                <ShowModalGlobalProvider>
                  < SearchByPhoneProvider>
                    <RootLayoutContent>{children}</RootLayoutContent>
                  </ SearchByPhoneProvider>
                </ShowModalGlobalProvider>
              </OrderProvider>
            </CleanerProvider>
          </FunctionalModeProvider>
        </OrderCreateModeProvider>
      </body>
    </html>
  );
}

