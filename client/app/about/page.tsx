'use client'

import { Grid, Typography } from '@mui/material'
import Image from 'next/image'

const AboutPage: React.FC = () => {
    return (
        <Grid
            container
            spacing={2}
            sx={{
                px: 2,
                py: 1,
                color: 'white',
                bgcolor: 'black',
                minHeight: '100vh',
                flexDirection: 'column',
                fontFamily: 'Titillium Web, sans-serif;',
            }}
        >
            <Grid>
                <Image
                    style={{ width: '100%', height: 500, objectFit: 'cover' }}
                    src={require('@/public/about1.jpg')}
                    alt={'About Stagnum'}
                />

                <Typography
                    variant="h1"
                    mt={4}
                    mb={6}
                    textAlign={'center'}
                    sx={{
                        color: 'primary.main',
                    }}
                >
                    About Stagnum
                </Typography>
            </Grid>

            <Typography variant="h3" textAlign={'center'}>
                Stagnum has been designed to enhance Spotify listening
                experience using pool based playback for better song shuffles,
                and collaborative listening.
            </Typography>

            <Grid
                container
                sx={{
                    mt: 2,
                    display: 'flex',
                }}
            >
                <Grid
                    width={'50%'}
                    sx={{
                        px: 2,
                        py: 1,
                    }}
                >
                    <Typography
                        variant="h4"
                        mt={15}
                        textAlign={'center'}
                        sx={{
                            color: 'primary.main',
                        }}
                    >
                        Hello !!! Thank you for visiting Stagnum!
                    </Typography>
                    <Typography variant="h4" textAlign={'center'}>
                        This page serves as your one-stop guide for all you need
                        to know about Stagnum.
                    </Typography>
                </Grid>
                <Image
                    width={'50%'}
                    src={require('@/public/try.png')}
                    alt={'headphone'}
                />
            </Grid>

            <Grid
                container
                sx={{
                    mt: 2,
                    display: 'flex',
                }}
            >
                <Image
                    width={'50%'}
                    src={require('@/public/exx1.png')}
                    alt={'headphone'}
                />

                <Grid
                    width={'50%'}
                    sx={{
                        px: 2,
                        py: 1,
                    }}
                >
                    <Typography variant="h5" mt={15} textAlign={'center'}>
                        Stagnum is an open source project that aims to be a
                        simple and intuitive alternative way of controlling your
                        Spotify.
                    </Typography>
                    <Typography
                        variant="h5"
                        mt={2}
                        textAlign={'center'}
                        sx={{
                            color: 'primary.main',
                        }}
                    >
                        Disclaimer!
                    </Typography>
                    <Typography mt={1} textAlign={'center'}>
                        To comply with Spotify’s guidelines, Stagnum can only be
                        used by users with Spotify Premium.
                    </Typography>
                </Grid>
            </Grid>

            <Grid px={2} py={1}>
                <Typography
                    variant="h1"
                    mt={4}
                    mb={6}
                    textAlign={'center'}
                    sx={{
                        color: 'primary.main',
                    }}
                >
                    How To Use
                </Typography>

                <Grid
                    container
                    sx={{
                        mt: 2,
                        display: 'flex',
                    }}
                >
                    <Grid width={'25%'}>
                        <Typography
                            variant="h3"
                            mt={4}
                            textAlign={'center'}
                            sx={{
                                color: 'primary.main',
                            }}
                        >
                            1.
                        </Typography>
                        <Typography variant="h5" mb={6} textAlign={'center'}>
                            Login with your Spotify Premium Account
                        </Typography>
                    </Grid>

                    <Grid width={'25%'}>
                        <Typography
                            variant="h3"
                            mt={4}
                            textAlign={'center'}
                            sx={{
                                color: 'primary.main',
                            }}
                        >
                            2.
                        </Typography>
                        <Typography variant="h5" mb={6} textAlign={'center'}>
                            Search for your favorite songs and add them to the
                            pool
                        </Typography>
                    </Grid>

                    <Grid width={'25%'}>
                        <Typography
                            variant="h3"
                            mt={4}
                            textAlign={'center'}
                            sx={{
                                color: 'primary.main',
                            }}
                        >
                            3.
                        </Typography>
                        <Typography variant="h5" mb={6} textAlign={'center'}>
                            Create pool and invite your friends to join
                        </Typography>
                    </Grid>

                    <Grid width={'25%'}>
                        <Typography
                            variant="h3"
                            mt={4}
                            textAlign={'center'}
                            sx={{
                                color: 'primary.main',
                            }}
                        >
                            4.
                        </Typography>
                        <Typography variant="h5" mb={6} textAlign={'center'}>
                            To join existing pool, enter the pool code
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default AboutPage
