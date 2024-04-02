'use client'

import Footer from '@/components/layout/footer'
import { Box, CssBaseline, Grid } from '@mui/material'
import axios from 'axios'
import { useSearchParams, redirect } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { ThemeProvider } from '@emotion/react'
import theme from '../utils/theme'
import MainHeaderCard from '@/components/layout/cards/mainHeaderCard'
import Search from '@/components/layout/search'
import PoolManager from '@/components/layout/poolManager'
import '@/components/layout/css/customScrollBar.css'
import ExpandedSearchContent from '@/components/layout/expandedSearchContent'
import Track from '@/types/trackTypes'
import Artist from '@/types/artistTypes'
import Playlist from '@/types/playlistTypes'
import Album from '@/types/albumTypes'

export default function HomePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HomeContent />
        </Suspense>
    )
}

function HomeContent() {
    const [pool, setPool] = useState<Pool>({
        users: [],
        share_code: null,
    })
    const [token, setToken] = useState('')
    const [expanded, setExpanded] = useState(false)
    const [trackList, setTrackList] = useState<Track[]>([])
    const [artistList, setArtistList] = useState<Artist[]>([])
    const [playlistList, setPlaylistList] = useState<Playlist[]>([])
    const [albumList, setAlbumList] = useState<Album[]>([])
    const [disabled, setDisabled] = useState(true)
    const queryParams = useSearchParams()
    const code = queryParams.get('code')
    const state = queryParams.get('state')
    const client_redirect_uri = process.env.NEXT_PUBLIC_FRONTEND_URI

    useEffect(() => {
        if (code && state) {
            handleTokenRequest(code, state)
        }
        else {
            redirect('/login')
        }
    }, [])

    const handleTokenRequest = (code: string, state: string) => {
        axios
            .get(`${process.env.NEXT_PUBLIC_BACKEND_URI}/auth/login/callback`, {
                params: { state, code, client_redirect_uri },
            })
            .then(function (response) {
                setToken(response.data.access_token)
            })
            .catch((error) => {
                // TODO Error alert
            })
    }

    const updatePool = (pool: Pool) => {
        setPool(pool)
    }

    const toggleExpanded = () => {
        setExpanded(!expanded)
    }

    const enableAddButton = () => {
        setDisabled(false)
    }

    const setSearchResults = (data: any) => {
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
                    <MainHeaderCard />
                </Grid>

                <Grid item xs={9}>
                    <Box
                        sx={{
                            padding: 1,
                            height: expanded ? '100%' : '10vh',
                        }}
                    >
                        <Search
                            token={token}
                            updatePool={updatePool}
                            expanded={expanded}
                            toggleExpanded={toggleExpanded}
                            setSearchResults={setSearchResults}
                            enableAddButton={enableAddButton}
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
                        token={token}
                        updatePool={updatePool}
                        expanded={expanded}
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
                                token={token}
                                disabled={disabled}
                                enableAddButton={enableAddButton}
                            />
                        </Box>
                    </Grid>
                )}
            </Grid>
            <Footer token={token} />
        </ThemeProvider>
    )
}
