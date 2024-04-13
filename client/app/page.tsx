'use client'

import Footer from '@/components/layout/footer'
import { Box, CssBaseline, Grid } from '@mui/material'
import axios from 'axios'
import { useSearchParams, redirect } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { ThemeProvider } from '@emotion/react'
import theme from '../components/theme'
import MainHeader from '@/components/searchComponents/cards/mainHeader'
import Search from '@/components/searchComponents/search'
import PoolManager from '@/components/poolmanagerComponents/poolManager'
import '@/css/customScrollBar.css'
import ExpandedSearchContent from '@/components/searchComponents/expandedSearchContent'
import { Album, Artist, Playlist, Pool, Track } from '@/components/types'
import AlertComponent from '@/components/alertComponent'

const HomePage: React.FC = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HomeContent />
        </Suspense>
    )
}

const HomeContent: React.FC = () => {
    const [pool, setPool] = useState<Pool>({
        users: [],
        share_code: null,
    })
    const [alert, setAlert] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [expanded, setExpanded] = useState(false)
    const [trackList, setTrackList] = useState<Track[]>([])
    const [artistList, setArtistList] = useState<Artist[]>([])
    const [playlistList, setPlaylistList] = useState<Playlist[]>([])
    const [albumList, setAlbumList] = useState<Album[]>([])
    const [disabled, setDisabled] = useState(true)
    const [ongoingSearch, setOngoingSearch] = useState(false)
    const queryParams = useSearchParams()
    const code = queryParams.get('code')
    const state = queryParams.get('state')
    const client_redirect_uri = process.env.NEXT_PUBLIC_FRONTEND_URI
    const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI

    // If this gets deleted 'reactStrictMode: false' can be removed from next.config.js
    useEffect(() => {
        checkIfPoolExists()
    }, [])

    const checkIfPoolExists = (): void => {
        axios
            .get(`${backend_uri}/pool/`, {
                headers: { Authorization: localStorage.getItem('token') },
            })
            .then((response) => {
                updatePool(response.data)
            })
            .catch(() => {
                if (code && state) {
                    handleTokenRequest(code, state)
                } else {
                    redirect('/login')
                }
            })
    }

    const handleTokenRequest = (code: string, state: string): void => {
        axios
            .get(`${process.env.NEXT_PUBLIC_BACKEND_URI}/auth/login/callback`, {
                params: { state, code, client_redirect_uri },
            })
            .then((response) => {
                localStorage.setItem('token', response.data.access_token)
            })
            .catch((error) => {
                setErrorAlert(
                    `Login callback failed with error: ${error.response.data.detail}`,
                )
                redirect('/login')
            })
    }

    const toggleOngoingSearch = (): void => {
        setOngoingSearch((prevOngoingSearch) => !prevOngoingSearch)
    }

    const setErrorAlert = (message: string): void => {
        setErrorMessage(message)
        setAlert(true)
    }

    const closeAlert = (): void => {
        setAlert(false)
    }

    const updatePool = (pool: Pool): void => {
        setPool(pool)
    }

    const toggleExpanded = (): void => {
        setExpanded(!expanded)
    }

    const enableAddButton = (): void => {
        setDisabled(false)
    }

    const setSearchResults = (data: any): void => {
        setTrackList(data.tracks.results)
        setAlbumList(data.albums.results)
        setArtistList(data.artists.results)
        setPlaylistList(data.playlists.results)
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
                    <MainHeader />
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
                    sx={{ height: 'calc(90vh - 80px)', overflow: 'auto' }}
                >
                    <PoolManager
                        pool={pool}
                        updatePool={updatePool}
                        expanded={expanded}
                        setErrorAlert={setErrorAlert}
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
            <Footer setErrorAlert={setErrorAlert} />
            {alert && (
                <AlertComponent
                    alertMessage={errorMessage}
                    closeAlert={closeAlert}
                />
            )}
        </ThemeProvider>
    )
}

export default HomePage
