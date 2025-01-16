'use client';
import React, { useEffect, useState } from 'react';
import '@/styles/globals.scss';
import { Inter } from '@/assets/fonts/fonts';
import { QueryClient, QueryClientProvider, } from '@tanstack/react-query';
import { OrderProvider, TYPE_MODE, useOrder } from '@/providers/OrderProvider';
import useIdle from '@/hooks/trackInactivity';
import { TheModal } from '@/components/Client/TheModal/TheModal';
import { ButtonSecondary } from '@/components/Client/UI/ButtonSecondary/ButtonSecondary';
import { usePathname, useRouter } from 'next/navigation';
import { FunctionalModeProvider } from '@/providers/FunctionalMode';
const queryClient = new QueryClient();
function RootLayoutContent({ children }) {
    const [showModal, setShowModal] = useState(false);
    const { resetOrder, orderId, mode } = useOrder();
    const [idleEnabled, setIdleEnabled] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    useEffect(() => {
        if (!pathname)
            return;
        if (pathname.includes('/super-admin')) {
            setIdleEnabled(false);
        }
        else {
            setIdleEnabled(true);
        }
    }, [pathname]);
    const action = () => {
        if (orderId) {
            setShowModal(true);
        }
        else {
            router.push(`/`);
        }
    };
    useIdle({
        timeout: idleEnabled ? 60000 : 0,
        action: idleEnabled ? action : undefined,
    });
    useEffect(() => {
        let timer = null;
        if (showModal) {
            timer = setTimeout(() => {
                resetOrder();
                setShowModal(false);
                router.push(`/`);
            }, 30000);
        }
        return () => {
            if (timer)
                clearTimeout(timer);
        };
    }, [showModal, resetOrder]);
    return (<>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>

      {showModal && (<TheModal open={showModal} handleClose={() => setShowModal(false)} width={800}>
          <h3 style={{ marginTop: '50px', textAlign: 'center' }}>
            {mode == TYPE_MODE.CREAT ? `Хотите продолжить оформление заказа?` : `Хотите продолжить редактирование заказа?`}
          </h3>
          <div style={{
                display: 'flex',
                gap: '50px',
                alignItems: 'center',
                marginTop: '50px',
                justifyContent: 'center',
            }}>
            <ButtonSecondary text="Продолжить" onClick={() => setShowModal(false)}/>
            <ButtonSecondary text="Начать новый заказ" onClick={() => {
                resetOrder();
                setShowModal(false);
                router.push(`/`);
            }}/>
          </div>
        </TheModal>)}
    </>);
}
export default function RootLayout({ children }) {
    return (<html lang="ru">
      <head></head>
      <body className={`${Inter.variable}`}>
        <FunctionalModeProvider>
          <OrderProvider>
            <RootLayoutContent>{children}</RootLayoutContent>
          </OrderProvider>
        </FunctionalModeProvider>
      </body>
    </html>);
}
//# sourceMappingURL=layout.jsx.map