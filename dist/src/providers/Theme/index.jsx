'use client';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import canUseDOM from '@/utilities/canUseDOM';
import { defaultTheme, getImplicitPreference, themeLocalStorageKey } from './shared';
import { themeIsValid } from './types';
const initialContext = {
    setTheme: () => null,
    theme: undefined,
};
const ThemeContext = createContext(initialContext);
export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState(canUseDOM ? document.documentElement.getAttribute('data-theme') : undefined);
    const setTheme = useCallback((themeToSet) => {
        if (themeToSet === null) {
            window.localStorage.removeItem(themeLocalStorageKey);
            const implicitPreference = getImplicitPreference();
            document.documentElement.setAttribute('data-theme', implicitPreference || '');
            if (implicitPreference)
                setThemeState(implicitPreference);
        }
        else {
            setThemeState(themeToSet);
            window.localStorage.setItem(themeLocalStorageKey, themeToSet);
            document.documentElement.setAttribute('data-theme', themeToSet);
        }
    }, []);
    useEffect(() => {
        let themeToSet = defaultTheme;
        const preference = window.localStorage.getItem(themeLocalStorageKey);
        if (themeIsValid(preference)) {
            themeToSet = preference;
        }
        else {
            const implicitPreference = getImplicitPreference();
            if (implicitPreference) {
                themeToSet = implicitPreference;
            }
        }
        document.documentElement.setAttribute('data-theme', themeToSet);
        setThemeState(themeToSet);
    }, []);
    return <ThemeContext.Provider value={{ setTheme, theme }}>{children}</ThemeContext.Provider>;
};
export const useTheme = () => useContext(ThemeContext);
//# sourceMappingURL=index.jsx.map