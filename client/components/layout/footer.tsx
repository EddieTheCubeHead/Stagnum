import React, { useEffect, useRef, useState } from 'react'
import { Link, Box, Grid } from '@mui/material'
import theme from '@/components/theme'
import SkipButton from '../buttons/skipButton'
import { Text } from '../textComponents'
import { Playlist, Pool, Track } from '../types'
import useWebSocket from 'react-use-websocket'

interface FooterProps {
    // eslint-disable-next-line no-unused-vars
    setErrorAlert: (message: string) => void
    pool: Pool
}

const Footer: React.FC<FooterProps> = ({ setErrorAlert }) => {
    const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI
    const [currentTrack, setCurrentTrack] = useState<Track>({
        name: 'Playback not found',
        link: '',
        uri: '',
        artists: [],
        album: {} as any,
        duration_ms: 0,
    })
    const WS_URI = `${backend_uri?.replace('http', 'ws')}/pool/playback/register_listener?Authorization=${localStorage.getItem('token')}`
    const { lastJsonMessage } = useWebSocket(WS_URI, {
        share: false,
        shouldReconnect: () => true,
    })

    useEffect(() => {
        console.log(`Got a new message: ${lastJsonMessage}`)
    }, [lastJsonMessage])

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
                <Grid
                    item
                    xs={9}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    gap={2}
                >
                    {/*Image size fixed only for demo. Change when addressing first comment*/}
                    <img
                        src={currentTrack.link}
                        style={{ width: 50, height: 50, padding: 0, margin: 0 }}
                        alt="Track image"
                    />
                    <Text
                        text={currentTrack.name}
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
