'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#db2777', // Pink 600
      light: '#f472b6',
      dark: '#9d174d',
    },
    secondary: {
      main: '#9333ea', // Purple 600
    },
    background: {
      default: '#fff1f2', // Rose 50
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
