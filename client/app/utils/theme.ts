import { createTheme } from "@mui/material";

//MUI default font is Roboto
const theme = createTheme({
  palette: {
    background: {
      default: "#212121", // Black
    },
    primary: {
      main: "#1976D2", // Blue
    },
    secondary: {
      main: "#616161", // Dark grey
      dark: "#212121", // Black
      light: "#D9D9D9", // Light grey
    },
    warning: {
      main: "#D21919", // red
    },
  },
});

export default theme;
