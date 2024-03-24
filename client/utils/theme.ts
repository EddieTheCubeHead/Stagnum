import { createTheme } from '@mui/material'

//MUI default font is Roboto
const theme = createTheme({
    palette: {
        background: {
            default: '#000', // Black
        },
        primary: {
            main: '#1976D2', // Blue
        },
        secondary: {
            main: '#616161', // Gray
            dark: '#212121', // Dark Grey
            light: '#D9D9D9', // Light grey
        },
        warning: {
            main: '#D21919', // red
        },
    },
})

export default theme
