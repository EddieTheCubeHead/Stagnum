import { createTheme } from '@mui/material/styles';

const stagnumTheme = createTheme({
    palette: {
        primary: {
            light: '#616161',       // Light gray
            main: '#424242',        // Gray
            dark: '#000',        // Dark grey
            contrastText: '#fff',   // White
        },
        secondary: {
            light: '#42a5f5',       // Light Blue
            main: '#1976d2',        // Blue
            dark: '#0d47a1',        // Dark Blue
            contrastText: '#fff',   // White
        },
    },
})

export default stagnumTheme
