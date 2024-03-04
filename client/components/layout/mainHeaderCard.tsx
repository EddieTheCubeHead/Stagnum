import theme from '@/utils/theme'
import { Box, Grid } from '@mui/material'
import { Header2 } from '../textComponents'


export default function MainHeaderCard() {

    return (
        <Grid item xs={9}>
            <Box sx={{
                bgcolor: theme.palette.secondary.dark,
                width: 'auto',
                height: '20vh',
                borderRadius: 3,
                boxShadow: 2
            }}>
                <Header2 text='Stagnum' />

            </Box>
        </Grid>
    )
}