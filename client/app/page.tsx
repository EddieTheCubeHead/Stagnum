'use client'

import Footer from '@/components/layout/footer'
import { Box, CssBaseline, Grid } from '@mui/material'
import axios from 'axios'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { ThemeProvider } from '@emotion/react'
import theme from '../components/theme'
import Search from '@/components/searchComponents/search'
import PoolManager from '@/components/poolmanagerComponents/poolManager'
import '@/css/customScrollBar.css'
import ExpandedSearchContent from '@/components/searchComponents/expandedSearchContent'
import {
    Album,
    Artist,
    Playlist,
    Pool,
    PoolTrack,
    Track,
    User,
} from '@/components/types'
import AlertComponent from '@/components/alertComponent'
import Image from 'next/image'

const HomePage: React.FC = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HomePageContent />
        </Suspense>
    )
}

const HomePageContent: React.FC = () => {
    const [pool, setPool] = useState<Pool>({
        users: [],
        share_code: null,
        owner: null,
        currently_playing: {
            name: '',
            spotify_icon_uri: '',
            spotify_resource_uri: '',
            duration_ms: 0,
        },
    })
    const [alert, setAlert] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [alertType, setAlertType] = useState<'error' | 'success'>('error')
    const [expanded, setExpanded] = useState(false)
    const [trackList, setTrackList] = useState<Track[]>([])
    const [artistList, setArtistList] = useState<Artist[]>([])
    const [playlistList, setPlaylistList] = useState<Playlist[]>([])
    const [albumList, setAlbumList] = useState<Album[]>([])
    const [disabled, setDisabled] = useState(true)
    const [ongoingSearch, setOngoingSearch] = useState(false)
    const [currentTrack, setCurrentTrack] = useState<PoolTrack>({
        name: 'Playback',
        spotify_icon_uri: '',
        spotify_resource_uri: '',
        duration_ms: 0,
    })
    const [user, setUser] = useState<User>({
        display_name: '',
        icon_url: '',
        spotify_id: '',
    })
    const router = useRouter()
    const queryParams = useSearchParams()
    const code = queryParams.get('code')
    const state = queryParams.get('state')
    const client_redirect_uri = process.env.NEXT_PUBLIC_FRONTEND_URI
    const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI

    // If this gets deleted 'reactStrictMode: false' can be removed from next.config.js
    useEffect(() => {
        validateTokenAndInitializeData()
    }, [])

    const validateTokenAndInitializeData = (): void => {
        const headers = {
            Authorization: localStorage.getItem('token') || '',
        }

        axios
            .get(`${backend_uri}/me`, {
                headers: headers,
            })
            .then((response) => {
                setUser(response.data)
                silentGetPool(headers)
            })
            .catch(() => {
                if (code && state) {
                    handleTokenRequest(code, state)
                } else {
                    router.push('/login')
                }
            })
    }

    const handleTokenRequest = (code: string, state: string): void => {
        axios
            .get(`${process.env.NEXT_PUBLIC_BACKEND_URI}/auth/login/callback`, {
                params: { state, code, client_redirect_uri },
            })
            .then((response) => {
                localStorage.setItem(
                    'token',
                    response.config.headers.Authorization as string,
                )
                localStorage.setItem('token', response.data.access_token)
                openPlaybackSocket(response.data.access_token)
                getUser(response.data.access_token)
                silentGetPool({ Authorization: response.data.access_token })
            })
            .catch((error) => {
                setErrorAlert(
                    `Login callback failed with error: ${error.response.data.detail}`,
                    'error',
                )
                router.push('/login')
            })
    }

    const openPlaybackSocket = (token: string): void => {
        const WS_URI = `${backend_uri?.replace('http', 'ws')}/websocket/connect?Authorization=${token}`
        const socket = new WebSocket(WS_URI)

        socket.onopen

        socket.onmessage = function (event) {
            const res = JSON.parse(event.data)
            if (res.type === 'current_track') {
                setCurrentTrack(res.model)
            } else if (res.type === 'pool') {
                updatePool(res.model)
                setCurrentTrack(res.model.currently_playing)
            } else if (res.type === 'error') {
                setErrorAlert(
                    'Displaying current playback failed: ' + res.model,
                    'error',
                )
            }
        }
    }

    const getUser = (token: string): void => {
        axios
            .get(`${backend_uri}/me`, {
                headers: {
                    Authorization: token,
                },
            })
            .then((response) => {
                setUser(response.data)
            })
            .catch((error) => {
                setErrorAlert(
                    `Getting user failed with error: ${error.response.data.detail}`,
                    'error',
                )
            })
    }

    const silentGetPool = (headers: { Authorization: string }): void => {
        axios
            .get(`${backend_uri}/pool`, {
                headers: headers,
            })
            .then((response) => {
                setCurrentTrack(response.data.currently_playing)
                updatePool(response.data)
                const token = localStorage.getItem('token')
                if (typeof token === 'string') {
                    openPlaybackSocket(token)
                }
            })
            .catch(() => {
                console.log('Error in initial pool fetch')
            })
    }

    const handleDelete = (): void => {
        axios
            .delete(`${backend_uri}/pool`, {
                headers: {
                    Authorization: localStorage.getItem('token')
                        ? localStorage.getItem('token')
                        : '',
                },
            })
            .then((response) => {
                localStorage.setItem(
                    'token',
                    response.config.headers.Authorization as string,
                )
                console.log(response.data)
                updatePool(response.data)
            })
            .catch((error) => {
                setErrorAlert(
                    `Deleting pool failed with error: ${error.response.data.detail}`,
                    'error',
                )
            })
    }

    const handleLeave = (): void => {
        axios
            .post(
                `${backend_uri}/pool/leave`,
                {},
                {
                    headers: {
                        Authorization: localStorage.getItem('token')
                            ? localStorage.getItem('token')
                            : '',
                    },
                },
            )
            .then((response) => {
                localStorage.setItem(
                    'token',
                    response.config.headers.Authorization as string,
                )
                updatePool(response.data)
            })
            .catch((error) => {
                setErrorAlert(
                    `Leaving pool failed with error: ${error.response.data.detail}`,
                    'error',
                )
            })
    }

    const toggleOngoingSearch = (): void => {
        setOngoingSearch((prevOngoingSearch) => !prevOngoingSearch)
    }

    const setErrorAlert = (
        message: string,
        type: 'error' | 'success',
    ): void => {
        setErrorMessage(message)
        setAlert(true)
        setAlertType(type)
    }

    const closeAlert = (): void => {
        setAlert(false)
    }

    const updatePool = (pool: Pool): void => {
        setCurrentTrack(pool.currently_playing)
        setPool(pool)
    }

    const toggleExpanded = (): void => {
        setExpanded(!expanded)
    }

    const enableAddButton = (): void => {
        setDisabled(false)
    }

    const setSearchResults = (data: any): void => {
        setTrackList(data.tracks.items)
        setAlbumList(data.albums.items)
        setArtistList(data.artists.items)
        setPlaylistList(data.playlists.items)
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Grid
                container
                sx={{
                    padding: 1,
                    maxHeight: 'calc(100vh - 80px)',
                }}
            >
                <Grid item xs={3}>
                    <Image
                        src={require('@/public/Stagnum_Logo.png')}
                        alt={'Home background'}
                        style={{
                            objectFit: 'contain',
                            width: '100%',
                            height: '100%',
                            padding: 2,
                        }}
                    />
                </Grid>

                <Grid item xs={9}>
                    <Box
                        sx={{
                            padding: 1,
                            height: expanded ? '100%' : '10vh',
                        }}
                    >
                        <Search
                            updatePool={updatePool}
                            expanded={expanded}
                            toggleExpanded={toggleExpanded}
                            setSearchResults={setSearchResults}
                            enableAddButton={enableAddButton}
                            setErrorAlert={setErrorAlert}
                            toggleOngoingSearch={toggleOngoingSearch}
                        />
                    </Box>
                </Grid>

                <Grid
                    item
                    xs={expanded ? 3 : 12}
                    sx={{
                        height: 'calc(90vh - 80px)',
                        overflow: 'auto',
                        mt: expanded ? 0 : 1.5,
                    }}
                >
                    <PoolManager
                        pool={pool}
                        updatePool={updatePool}
                        expanded={expanded}
                        setErrorAlert={setErrorAlert}
                        user={user}
                        handleDelete={handleDelete}
                        handleLeave={handleLeave}
                    />
                </Grid>

                {expanded && (
                    <Grid
                        item
                        xs={9}
                        sx={{
                            height: 'calc(90vh - 80px)',
                            overflow: 'auto',
                            paddingLeft: 1,
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                width: 1,
                                bgcolor: 'secondary.dark',
                                borderBottomLeftRadius: 12,
                                borderBottomRightRadius: 12,
                            }}
                        >
                            <ExpandedSearchContent
                                trackList={trackList}
                                albumList={albumList}
                                playlistList={playlistList}
                                artistList={artistList}
                                updatePool={updatePool}
                                disabled={disabled}
                                enableAddButton={enableAddButton}
                                setErrorAlert={setErrorAlert}
                                ongoingSearch={ongoingSearch}
                            />
                        </Box>
                    </Grid>
                )}
            </Grid>
            <Footer
                setErrorAlert={setErrorAlert}
                pool={pool}
                currentTrack={currentTrack}
                user={user}
                handleDelete={handleDelete}
                handleLeave={handleLeave}
            />
            {alert && (
                <AlertComponent
                    alertMessage={errorMessage}
                    closeAlert={closeAlert}
                    type={alertType}
                />
            )}
        </ThemeProvider>
    )
}

export default HomePage
