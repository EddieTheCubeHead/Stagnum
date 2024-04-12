import { Grid, Typography } from '@mui/material'

const AboutPage: React.FC = () => {
    return (
        <Grid
            container
            spacing={2}
            sx={{
                px: 2,
                py: 4,
                color: 'white',
                bgcolor: 'black',
                width: '100%',
                height: '100%',
                minHeight: '100vh',
                flexDirection: 'column',
            }}
        >
            <Typography variant="h1" mb={4}>
                About Stagnu
            </Typography>
            <Typography>
                Stagnum is an open source project that aims to be a simple and
                intuitive alternative way of controlling your Spotify.
            </Typography>
        </Grid>
    )
}

export default AboutPage
