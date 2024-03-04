import theme from '@/utils/theme'
import Track from '@/types/trackTypes'
import { Box, Grid, MenuItem, Select, TextField, Typography, } from '@mui/material'
import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import TrackCard from './cards/trackCard'
import SearchInput from '../inputfields.tsx/searchInput'
import { Header2, Header3 } from '../textComponents'
import Playlist from '@/types/playlistTypes'
import Album from '@/types/albumTypes'
import Artist from '@/types/artistTypes'
import AlbumCard from './cards/albumCard'
import PlaylistCard from './cards/playlistCard'
import ArtistCard from './cards/artistCard'

interface Props {
    token: string
}

export default function Search({ token }: Props) {
    const mounted = useRef(false)
    const [query, setQuery] = useState('')
    const [trackList, setTrackList] = useState<Track[]>([])
    const [artistList, setArtistList] = useState<Artist[]>([])
    const [playlistList, setPlaylistList] = useState<Playlist[]>([])
    const [albumList, setAlbumList] = useState<Album[]>([])

    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

    const handleSearchRequest = (searchQuery: string) => {
        console.log('Searching song with:', searchQuery)

        axios.get('http://localhost:8080/search',
            {
                params: { query },
                headers: { token }
            })
            .then(function (response) {
                console.log(response)
                setTrackList(response.data.tracks.results)
                setAlbumList(response.data.albums.results)
                setArtistList(response.data.artists.results)
                setPlaylistList(response.data.playlists.results)
                console.log(trackList)
            }).catch((error) => {
                console.log('Request failed', error)
            })
    }

    useEffect(() => {
        if (!mounted.current) {
            console.log(mounted.current)
            mounted.current = true
        } else {
            console.log(mounted.current)
            if (searchTimeout) {
                clearTimeout(searchTimeout)
            }

            // Set a timeout to execute the search after 2 seconds
            const timeout = setTimeout(() => {
                handleSearchRequest(query)
            }, 2000)

            // Save the timeout ID for cleanup
            setSearchTimeout(timeout)

            // Cleanup function to clear the timeout when component unmounts or when query changes
            return () => {
                if (searchTimeout) {
                    clearTimeout(searchTimeout)
                }
            }
        }

    }, [query])

    return (
        <Grid item xs={9}>
            <Box sx={{
                bgcolor: theme.palette.secondary.dark,
                width: 'auto',
                height: '90vh',
                borderRadius: 3,
                boxShadow: 2
            }}>
                <SearchInput setQuery={setQuery} />
                <Grid container spacing={1} columns={10} sx={{ padding: 1 }}>
                    {trackList &&
                        <Grid item xs={10}>
                            <Box sx={{ height: 'auto' }}>
                                <Header2 text={'Tracks'} />

                                <Grid container spacing={1} columns={10} sx={{ padding: 1 }}>
                                    {trackList.slice(0, 5).map((track, key) => (
                                        <Grid item xs={2} key={key}>
                                            <Box style={{
                                                position: 'relative',
                                                width: '100%',
                                                paddingTop: '100%',
                                            }}>
                                                <TrackCard track={track} />
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </Grid>
                    }
                    {albumList &&
                        <Grid item xs={10}>
                            <Box sx={{ height: 'auto' }}>
                                <Header2 text={'Album'} />
                                <Grid container spacing={1} columns={10} sx={{ padding: 1 }}>
                                    {albumList.slice(0, 5).map((album, key) => (
                                        <Grid item xs={2} key={key}>
                                            <Box style={{
                                                position: 'relative',
                                                width: '100%',
                                                paddingTop: '100%',
                                            }}>
                                                <AlbumCard album={album} />
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </Grid>
                    }
                    {playlistList &&
                        <Grid item xs={10}>
                            <Box sx={{ height: 'auto' }}>
                                <Header2 text={'Playlists'} />
                                <Grid container spacing={1} columns={10} sx={{ padding: 1 }}>
                                    {playlistList.slice(0, 5).map((playlist, key) => (
                                        <Grid item xs={2} key={key}>
                                            <Box style={{
                                                position: 'relative',
                                                width: '100%',
                                                paddingTop: '100%',
                                            }}>
                                                <PlaylistCard playlist={playlist} />
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </Grid>
                    }
                    {artistList &&
                        <Grid item xs={10}>
                            <Box sx={{ height: 'auto' }}>
                                <Header2 text={'Artists'} />
                                <Grid container spacing={1} columns={10} sx={{ padding: 1 }}>
                                    {artistList.slice(0, 5).map((artist, key) => (
                                        <Grid item xs={2} key={key}>
                                            <Box style={{
                                                position: 'relative',
                                                width: '100%',
                                                paddingTop: '100%',
                                            }}>
                                                <ArtistCard artist={artist} />
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </Grid>
                    }
                </Grid>

            </Box>
        </Grid>
    )
}