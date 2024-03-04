import theme from '@/utils/theme'
import Track from '@/types/trackTypes'
import { Box, Grid, MenuItem, Select, Stack, TextField, Typography, } from '@mui/material'
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
    const [trackList, setTrackList] = useState<Track[]>([{
        duration_ms: 172087,
        name: "Auto jää (feat. Käärijä)",
        uri: "spotify:track:3rsDUslPzGw6sGHjkM4lg2"
    }, {
        duration_ms: 172087,
        name: "Auto jää (feat. Käärijä)",
        uri: "spotify:track:3rsDUslPzGw6sGHjkM4lg2"
    }, {
        duration_ms: 172087,
        name: "Auto jää (feat. Käärijä)",
        uri: "spotify:track:3rsDUslPzGw6sGHjkM4lg2"
    }, {
        duration_ms: 172087,
        name: "Auto jää (feat. Käärijä)",
        uri: "spotify:track:3rsDUslPzGw6sGHjkM4lg2"
    }, {
        duration_ms: 172087,
        name: "Auto jää (feat. Käärijä)",
        uri: "spotify:track:3rsDUslPzGw6sGHjkM4lg2"
    }, {
        duration_ms: 172087,
        name: "Auto jää (feat. Käärijä)",
        uri: "spotify:track:3rsDUslPzGw6sGHjkM4lg2"
    }, {
        duration_ms: 172087,
        name: "Auto jää (feat. Käärijä)",
        uri: "spotify:track:3rsDUslPzGw6sGHjkM4lg2"
    }, {
        duration_ms: 172087,
        name: "Auto jää (feat. Käärijä)",
        uri: "spotify:track:3rsDUslPzGw6sGHjkM4lg2"
    }])
    const [artistList, setArtistList] = useState<Artist[]>([])
    const [playlistList, setPlaylistList] = useState<Playlist[]>([])
    const [albumList, setAlbumList] = useState<Album[]>([{
        icon_link: "https://i.scdn.co/image/ab67616d0000b2739bbb9f1a2d191cdfb753edfc",
        name: "It's Crazy It's Party (feat. Tommy Cash)",
        uri: "spotify:album:0YFNkhRzugyL2Td9loECCh",
        year: 2023
    }, {
        icon_link: "https://i.scdn.co/image/ab67616d0000b2739bbb9f1a2d191cdfb753edfc",
        name: "It's Crazy It's Party (feat. Tommy Cash)",
        uri: "spotify:album:0YFNkhRzugyL2Td9loECCh",
        year: 2023
    }, {
        icon_link: "https://i.scdn.co/image/ab67616d0000b2739bbb9f1a2d191cdfb753edfc",
        name: "It's Crazy It's Party (feat. Tommy Cash)",
        uri: "spotify:album:0YFNkhRzugyL2Td9loECCh",
        year: 2023
    }, {
        icon_link: "https://i.scdn.co/image/ab67616d0000b2739bbb9f1a2d191cdfb753edfc",
        name: "It's Crazy It's Party (feat. Tommy Cash)",
        uri: "spotify:album:0YFNkhRzugyL2Td9loECCh",
        year: 2023
    }, {
        icon_link: "https://i.scdn.co/image/ab67616d0000b2739bbb9f1a2d191cdfb753edfc",
        name: "It's Crazy It's Party (feat. Tommy Cash)",
        uri: "spotify:album:0YFNkhRzugyL2Td9loECCh",
        year: 2023
    }, {
        icon_link: "https://i.scdn.co/image/ab67616d0000b2739bbb9f1a2d191cdfb753edfc",
        name: "It's Crazy It's Party (feat. Tommy Cash)",
        uri: "spotify:album:0YFNkhRzugyL2Td9loECCh",
        year: 2023
    }])

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
                height: '90vh',
                borderRadius: 3,
                boxShadow: 2
            }}>
                <SearchInput setQuery={setQuery} />
                <Stack >
                    {trackList &&
                        <Box >
                            <Header2 text={'Tracks'} />
                            <Box sx={{ display: 'flex', margin: 1 }}>
                                {trackList.slice(0, 5).map((track, key) => (
                                    <TrackCard track={track} key={key} />
                                ))}
                            </Box>
                        </Box>
                    }
                    {albumList &&
                        <Box >
                            <Header2 text={'Album'} />
                            <Box sx={{ display: 'flex', margin: 1 }}>
                                {albumList.slice(0, 5).map((album, key) => (
                                    <AlbumCard album={album} key={key} />
                                ))}
                            </Box>

                        </Box>
                    }
                    {playlistList &&
                        <Box >
                            <Header2 text={'Playlists'} />
                            {playlistList.slice(0, 5).map((playlist, key) => (


                                <PlaylistCard playlist={playlist} />

                            ))}
                        </Box>
                    }
                </Stack>

            </Box>
        </Grid>
    )
}