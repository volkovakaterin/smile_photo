import React from 'react';
import { HeaderThemeProvider } from './HeaderTheme';
import { ThemeProvider } from './Theme';
export const Providers = ({ children }) => {
    return (<ThemeProvider>
      <HeaderThemeProvider>{children}</HeaderThemeProvider>
    </ThemeProvider>);
};
//# sourceMappingURL=index.jsx.map