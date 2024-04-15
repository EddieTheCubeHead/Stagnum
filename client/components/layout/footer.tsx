import React, { useEffect, useState } from 'react'
import { Link, Box, Grid } from '@mui/material'
import theme from '@/components/theme'
import SkipButton from '../buttons/iconButtons/skipButton'
import { Text } from '../textComponents'
import { Pool, PoolTrack } from '../types'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import NegativeButton from '../buttons/negativeButton'

interface FooterProps {
    // eslint-disable-next-line no-unused-vars
    setErrorAlert: (message: string) => void
    pool: Pool
}

const Footer: React.FC<FooterProps> = ({ setErrorAlert, pool }) => {
    const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI
    const router = useRouter()
    const [currentTrack, setCurrentTrack] = useState<PoolTrack>({
        name: 'Playback',
        spotify_icon_uri: '',
        spotify_track_uri: '',
        duration_ms: 0,
    })

    useEffect(() => {
        if (localStorage.getItem('token')) {
            const WS_URI = `${backend_uri?.replace('http', 'ws')}/pool/playback/register_listener?Authorization=${localStorage.getItem('token')}`
            const socket = new WebSocket(WS_URI)

            socket.onopen = () => {}

            socket.onmessage = function (event) {
                const res = JSON.parse(event.data)
                console.log(res)
                if ((res.type = 'model')) {
                    setCurrentTrack(res.model)
                } else if ((res.type = 'error')) {
                    setErrorAlert(
                        'Displaying current playback failed: ' + res.model,
                    )
                }
            }
        }
    }, [pool])

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
                <Grid item xs={2} sx={{ padding: 1 }}>
                    <NegativeButton text={'Log out'} action={setTokenToNull} />
                </Grid>
                <Grid
                    item
                    xs={8}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    container
                    gap={2}
                >
                    {/*Image size fixed only for demo. Change when addressing first comment*/}
                    <Image
                        style={{
                            width: 50,
                            height: 50,
                        }}
                        src={
                            currentTrack.spotify_icon_uri.length > 0
                                ? currentTrack.spotify_icon_uri
                                : require('@/public/logo.png')
                        }
                        alt={'Track image'}
                    />

                    <Text
                        text={currentTrack.name}
                        fontWeight={'bold'}
                        color={'white'}
                    />

                    <SkipButton
                        setErrorAlert={setErrorAlert}
                        disabled={pool.users.length == 0}
                    />
                </Grid>
                <Grid
                    item
                    xs={2}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    sx={{ padding: 1 }}
                    container
                >
                    <Grid item xs={6}>
                        <Link
                            sx={{
                                color: theme.palette.primary.contrastText,
                                paddingRight: 2,
                            }}
                            href="/about"
                        >
                            About Stagnum
                        </Link>
                    </Grid>
                    <Grid item xs={6}>
                        <Link
                            sx={{
                                color: theme.palette.primary.contrastText,
                            }}
                            href="https://github.com/EddieTheCubeHead/Stagnum/discussions"
                            target="_blank"
                        >
                            Contact Us
                        </Link>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    )
}

export default Footer
