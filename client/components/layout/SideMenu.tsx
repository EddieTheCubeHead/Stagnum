import { Box, List, ListItemButton, ListItemText, ThemeProvider } from "@mui/material"
import stagnumTheme from '@/theme/stagnumTheme'

type Props = {
    setShowSearchBar: (show: boolean) => void
    showSearchBar: boolean
}

export default function SideMenu({ setShowSearchBar, showSearchBar }: Props) {
    return (
        <ThemeProvider theme={stagnumTheme}>
            <Box sx={{
                bgcolor: stagnumTheme.palette.primary.main,
                width: 'auto',
                height: 'auto',
                borderRadius: 3,
                boxShadow: 2
            }}>
                <List>
                    <ListItemButton sx={{
                        bgcolor: stagnumTheme.palette.primary.light,
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