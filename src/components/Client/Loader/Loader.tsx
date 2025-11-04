// 'use client';

// import React, { createContext, useCallback, useContext, useMemo, useRef, useState, useEffect } from 'react';
// import { createPortal } from 'react-dom';

// type Ctx = {
//     startTask: () => () => void;     // вызывает -> возвращает end()
//     setLoading: (v: boolean) => void; // императивно
//     isLoading: boolean;
// };

// const LoadingCtx = createContext<Ctx | null>(null);

// export const useLoadingOverlay = () => {
//     const ctx = useContext(LoadingCtx);
//     if (!ctx) throw new Error('useLoadingOverlay must be used within LoadingOverlayProvider');
//     return ctx;
// };

// const LoadingOverlay = ({ show }: { show: boolean }) => {
//     if (!show) return null;
//     return createPortal(
//         <div
//             style={{
//                 position: 'fixed', inset: 0, zIndex: 9999,
//                 background: 'rgba(0,0,0,0.25)',
//                 display: 'flex', alignItems: 'center', justifyContent: 'center',
//                 backdropFilter: 'blur(1px)'
//             }}
//             aria-busy="true"
//             aria-live="polite"
//         >
//             <div
//                 role="status"
//                 style={{
//                     width: 56, height: 56, borderRadius: '50%',
//                     border: '6px solid rgba(255,255,255,0.35)',
//                     borderTopColor: '#fff',
//                     animation: 'spin 0.8s linear infinite'
//                 }}
//             />
//             <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//         </div>,
//         document.body
//     );
// };

// export const LoadingOverlayProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
//     const counterRef = useRef(0);
//     const [isLoading, setIsLoading] = useState(false);

//     // переключаем класс на body для курсора
//     useEffect(() => {
//         if (typeof document === 'undefined') return;
//         const cls = 'busy-cursor';
//         if (isLoading) document.body.classList.add(cls);
//         else document.body.classList.remove(cls);
//         return () => document.body.classList.remove(cls);
//     }, [isLoading]);

//     const setLoading = useCallback((v: boolean) => {
//         counterRef.current = Math.max(0, v ? counterRef.current + 1 : counterRef.current - 1);
//         setIsLoading(counterRef.current > 0);
//     }, []);

//     const startTask = useCallback(() => {
//         setLoading(true);
//         let done = false;
//         return () => {
//             if (done) return;
//             done = true;
//             setLoading(false);
//         };
//     }, [setLoading]);

//     const value = useMemo(() => ({ startTask, setLoading, isLoading }), [startTask, setLoading, isLoading]);

//     return (
//         <LoadingCtx.Provider value={value}>
//             {children}
//             <LoadingOverlay show={isLoading} />
//         </LoadingCtx.Provider>
//     );
// };
