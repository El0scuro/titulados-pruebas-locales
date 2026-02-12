'use client';
import localFont from 'next/font/local';
import { createTheme } from '@mui/material/styles';

const Swis721BT = localFont({
  src: [
    { path: 'Utils/Swis721BT.ttf', weight: '400' },
    { path: 'Utils/Swis721BT italic.ttf', weight: '400'},
    { path: 'Utils/Swis721BT bold.ttf', weight: '700' },
    { path: 'Utils/Swis721BT bold italic.ttf', weight: '700'},
    { path: 'Utils/Swis721BT CN.ttf', weight: '400' },
    { path: 'Utils/Swis721BT CN bold.ttf', weight: '700' },
    { path: 'Utils/Swis721BT CN bold italic.ttf', weight: '700'},
    { path: 'Utils/Swis721BT CN italic.ttf', weight: '700'}
  ],
});

const theme = createTheme({
  typography: {
    fontFamily: Swis721BT.style.fontFamily,
  },
  palette: {
    primary: {
      main: '#003c58', // Define el color primario como #003c58
    },
    secondary: {
      main: '#ffffff', // Ejemplo: blanco como color secundario #ffffff
    },
    background: {
      default: '#f5f5f5', // Opcional: Define un color de fondo #f5f5f5
    },
    text: {
      primary: '#003c58', // Puedes usar este color para texto si lo necesitas #003c58
    },
  },
});

export default theme;