'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { StyledRoot } from './StyledRoot';
import theme from './theme'
import { ThemeProvider } from "@mui/material/styles";
import { TokenProvider } from './context/TokenContext';
import './globals.css';


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
              <StyledRoot>
                <TokenProvider>
                  {children}
                </TokenProvider>
              </StyledRoot>
            </ThemeProvider>
          </AppRouterCacheProvider>
      </body>
    </html>
  );
}
