import React from 'react'
import { Link, Box, Grid } from '@mui/material'
import theme from '@/components/theme'
import SkipButton from '../buttons/iconButtons/skipButton'
import { Text } from '../textComponents'
import { Playlist } from '../types'
import { useRouter } from 'next/navigation'
import NegativeButton from '../buttons/negativeButton'

interface FooterProps {
    // eslint-disable-next-line no-unused-vars
    setErrorAlert: (message: string, type: 'error' | 'success') => void
}

const Footer: React.FC<FooterProps> = ({ setErrorAlert }) => {
    const router = useRouter()

    const playlist: Playlist = {
        name: '90s Ambient Techno Mix',
        uri: 'spotify:playlist:37i9dQZF1EIfMxLinpTxdB',
        link: '',
        icon_link:
            'https://seed-mix-image.spotifycdn.com/v6/img/desc/90s%20Ambient%20Techno/en/large',
    }

    const setTokenToNull = (): void => {
        localStorage.removeItem('token')
        router.push('/login')
    }

    return (
        <Box
            sx={{
                bgcolor: theme.palette.secondary.dark,
                flexGrow: 1,
                height: 60,
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
            }}
        >
            <Grid container>
                <Grid item xs={1} sx={{ padding: 1 }}>
                    <NegativeButton text={'Log out'} action={setTokenToNull} />
                </Grid>
                <Grid
                    item
                    xs={8}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    gap={2}
                >
                    {/*Image size fixed only for demo. Change when addressing first comment*/}
                    <img
                        src={playlist.icon_link}
                        style={{ width: 50, height: 50, padding: 0, margin: 0 }}
                        alt="Track image"
                    />
                    <Text
                        text={playlist.name}
                        fontWeight={'bold'}
                        color={'white'}
                    />
                    <SkipButton setErrorAlert={setErrorAlert} />
                </Grid>
                <Grid
                    item
                    xs={3}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                >
                    <Link
                        sx={{
                            color: theme.palette.primary.contrastText,
                            paddingRight: 2,
                        }}
                        href="/about"
                    >
                        About Stagnum
                    </Link>
                    <Link
                        sx={{
                            color: theme.palette.secondary.main,
                        }}
                        href="https://github.com/EddieTheCubeHead/Stagnum/discussions"
                        target="_blank"
                    >
                        Contact Us
                    </Link>
                </Grid>
            </Grid>
        </Box>
    )
}

export default Footer
