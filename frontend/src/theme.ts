'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#d97706', // Amber 600
      light: '#fef08a', // Yellow 200
      dark: '#b45309', // Amber 700
    },
    secondary: {
      main: '#eab308', // Yellow 500
    },
    background: {
      default: '#fefce8', // Yellow 50
    },
  },
  typography: {
    fontFamily: 'inherit',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '12px',
        },
      },
    },
  },
});

export default theme;
