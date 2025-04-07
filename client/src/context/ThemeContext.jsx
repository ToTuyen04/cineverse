import React, { createContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export const ColorModeContext = createContext({
  toggleColorMode: () => {},
  mode: 'dark',
});

export const ThemeProviderWrapper = ({ children }) => {
  // Check localStorage for saved theme preference, default to 'dark' if none found
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'dark';
  });

  // Save theme preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      mode,
    }),
    [mode]
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                primary: { main: '#F9376E' },
                background: { default: '#f5f5f5', paper: '#ffffff' },
                text: { primary: '#000000', secondary: '#555555' },
              }
            : {
                primary: { main: '#F9376E' },
                background: { default: '#121212', paper: '#1e1e2d' },
                text: { primary: '#ffffff', secondary: '#b3b3b3' },
              }),
        },
        typography: {
          fontFamily: '"Raleway", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontFamily: '"Raleway", sans-serif',
            fontWeight: 600,
          },
          h2: {
            fontFamily: '"Raleway", sans-serif',
            fontWeight: 600,
          },
          h3: {
            fontFamily: '"Raleway", sans-serif',
            fontWeight: 600,
          },
          h4: {
            fontFamily: '"Raleway", sans-serif',
            fontWeight: 600,
          },
          h5: {
            fontFamily: '"Raleway", sans-serif',
            fontWeight: 600,
          },
          h6: {
            fontFamily: '"Raleway", sans-serif',
            fontWeight: 600,
          },
          button: {
            fontFamily: '"Raleway", sans-serif',
            fontWeight: 500,
          },
          body1: {
            fontFamily: '"Raleway", sans-serif',
          },
          body2: {
            fontFamily: '"Raleway", sans-serif',
          },
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};