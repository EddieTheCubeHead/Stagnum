import { Box, List, Stack } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import Track from '@/types/trackTypes'
import Artist from '@/types/artistTypes'
import Playlist from '@/types/playlistTypes'
import Album from '@/types/albumTypes'
import axios from 'axios'
import SearchInput from '../inputfields.tsx/searchInput'
import AlbumCard from './cards/albumCard'

export default function SideMenup(props: {
    token: string
    setShowSearchBar: (show: boolean) => void
    showSearchBar: boolean
    handleAdd: (newAdd: Album) => void
}) {
    const token: string = props.token
    const mounted = useRef(false)
    const [query, setQuery] = useState('')
    const [trackList, setTrackList] = useState<Track[]>([])
    const [artistList, setArtistList] = useState<Artist[]>([])
    const [playlistList, setPlaylistList] = useState<Playlist[]>([])
    const [albumList, setAlbumList] = useState<Album[]>([])

  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI

    const handleSearchRequest = (searchQuery: string) => {
        console.log('Searching song with:', searchQuery)

    axios
      .get(`${backend_uri}/search`, {
        params: { query },
        headers: { token },
      })
      .then(function (response) {
        console.log(response);
        setTrackList(response.data.tracks.results);
        setAlbumList(response.data.albums.results);
        setArtistList(response.data.artists.results);
        setPlaylistList(response.data.playlists.results);
        console.log(trackList);
      })
      .catch((error) => {
        console.log("Request failed", error);
      });
  };

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
        <Box
            sx={{
                bgcolor: 'secondary.dark',
                borderRadius: 3,
                boxShadow: 2,
            }}
        >
            <List>
                <SearchInput setQuery={setQuery} />
            </List>
            <Stack spacing={2} sx={{ margin: 2 }}>
                {albumList.slice(0, 5).map((album, key) => (
                    <AlbumCard
                        album={album}
                        key={key}
                        handleAdd={props.handleAdd}
                    />
                ))}
            </Stack>
        </Box>
    )
}
