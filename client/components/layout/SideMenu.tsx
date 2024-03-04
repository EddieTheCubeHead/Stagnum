import { Box, List, ListItemButton, ListItemText, ThemeProvider } from "@mui/material"
import theme from '@/utils/theme'

type Props = {
    setShowSearchBar: (show: boolean) => void
    showSearchBar: boolean
}

export default function SideMenu({ setShowSearchBar, showSearchBar }: Props) {
    return (
        <ThemeProvider theme={theme}>
            <Box sx={{
                bgcolor: theme.palette.secondary.dark,
                width: 'auto',
                height: 'auto',
                borderRadius: 3,
                boxShadow: 2
            }}>
                <List>
                    <ListItemButton sx={{
                        bgcolor: theme.palette.secondary.main,
                        marginX: 1,
                        borderRadius: 2
                    }} onClick={() => setShowSearchBar(!showSearchBar)}>
                        <ListItemText>Search</ListItemText>
                    </ListItemButton>
                </List>
            </Box>
        </ThemeProvider>
    )
}