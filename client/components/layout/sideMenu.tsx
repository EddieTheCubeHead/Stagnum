import { Box, List, ListItemButton, ListItemText, Stack, ThemeProvider } from "@mui/material"
import theme from '@/utils/theme'
import { useEffect, useRef, useState } from "react"
import Track from "@/types/trackTypes"
import Artist from "@/types/artistTypes"
import Playlist from "@/types/playlistTypes"
import Album from "@/types/albumTypes"
import axios from "axios"
import SearchInput from "../inputfields.tsx/searchInput"
import { Header2 } from "../textComponents"
import TrackCard from "./cards/trackCard"

export default function SideMenup(props: {
    token: string,
    setShowSearchBar: (show: boolean) => void,
    showSearchBar: boolean
}) {
    const token: string = props.token
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
        <ThemeProvider theme={theme}>
            <Box sx={{
                bgcolor: theme.palette.secondary.dark,
                borderRadius: 3,
                boxShadow: 2
            }}>
                <List>
                    <SearchInput setQuery={setQuery} />
                </List>
                <Stack spacing={2} sx={{ margin: 2 }}>
                    {trackList &&
                        trackList.slice(0, 5).map((track, key) => (
                            <TrackCard track={track} key={key} />
                        ))
                    }
                </Stack>
            </Box>
        </ThemeProvider>
    )
}