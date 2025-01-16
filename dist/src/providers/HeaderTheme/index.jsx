'use client';
import React, { createContext, useCallback, useContext, useState } from 'react';
import canUseDOM from '@/utilities/canUseDOM';
const initialContext = {
    headerTheme: undefined,
    setHeaderTheme: () => null,
};
const HeaderThemeContext = createContext(initialContext);
export const HeaderThemeProvider = ({ children }) => {
    const [headerTheme, setThemeState] = useState(canUseDOM ? document.documentElement.getAttribute('data-theme') : undefined);
    const setHeaderTheme = useCallback((themeToSet) => {
        setThemeState(themeToSet);
    }, []);
    return (<HeaderThemeContext.Provider value={{ headerTheme, setHeaderTheme }}>
      {children}
    </HeaderThemeContext.Provider>);
};
export const useHeaderTheme = () => useContext(HeaderThemeContext);
//# sourceMappingURL=index.jsx.map