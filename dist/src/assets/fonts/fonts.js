import localFont from 'next/font/local';
export const Firenight = localFont({
    variable: '--font-firenight',
    display: 'swap',
    preload: false,
    src: [
        {
            path: './Firenight-Regular.woff',
            weight: '400',
            style: 'normal',
        },
    ],
});
export const Calibri = localFont({
    variable: '--font-calibri',
    display: 'swap',
    preload: false,
    src: [
        {
            path: './Calibri.woff',
            weight: '400',
            style: 'normal',
        },
        {
            path: './Calibri-Bold.woff',
            weight: '700',
            style: 'normal',
        },
    ],
});
export const Inter = localFont({
    variable: '--font-inter',
    display: 'swap',
    preload: false,
    src: [
        {
            path: './Inter-Regular.woff',
            weight: '400',
            style: 'normal',
        },
        {
            path: './Inter-Medium.woff',
            weight: '500',
            style: 'normal',
        },
        {
            path: './Inter-Bold.woff',
            weight: '600',
            style: 'normal',
        },
        {
            path: './Inter-ExtraBold.woff',
            weight: '700',
            style: 'normal',
        },
    ],
});
//# sourceMappingURL=fonts.js.map