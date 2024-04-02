import { Grid, Typography } from '@mui/material'

export default function About() {
    return (
        // <main className="min-h-screen bg-green-50 text-black p-8 rounded-lg shadow-md">
        //   <div className="bg-green-500 text-white p-4 rounded-t-lg">
        //     <h1 className="text-3xl font-bold">About Stagnum</h1>
        //   </div>
        //     <p className="mt-4 text-lg">
        //     Stagnum is an open source project that aims to be a simple and intuitive alternative way of controlling your Spotify.
        //     </p>
        // </main>
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
                About Stagnum
            </Typography>
            <Typography>
                Stagnum is an open source project that aims to be a simple and
                intuitive alternative way of controlling your Spotify.
            </Typography>
        </Grid>
    )
}
