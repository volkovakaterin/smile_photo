import { HeaderClient } from './Component.client';
import { getCachedGlobal } from '@/utilities/getGlobals';
import React from 'react';
export async function Header() {
    const header = await getCachedGlobal('header', 1)();
    return <HeaderClient header={header}/>;
}
//# sourceMappingURL=Component.jsx.map