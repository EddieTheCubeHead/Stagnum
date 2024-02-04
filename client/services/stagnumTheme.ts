import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            light: '#616161',       // Light gray
            main: '#424242',        // Gray
            dark: '#212121',        // Dark grey
            contrastText: '#fff',   // White
        },
        secondary: {
            light: '#ff7961',       // Light Red
            main: '#f44336',        // Red
            dark: '#ba000d',        // Redder
            contrastText: '#000',   // Black
        },
    },
})

export default theme
