import Track from "@/types/trackTypes";
import {
    Box, Stack,
} from "@mui/material";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import SearchInput from "../inputfields.tsx/searchInput"
import Playlist from '@/types/playlistTypes'
import Album from "@/types/albumTypes"
import Artist from "@/types/artistTypes"
import CollapseIconButton from "../buttons/collapseIconButton";
import ExpandedSearchContent from "./expandedSearchContent";

interface Props {
    token: string;
    handleAdd: (newAdd: Track | Album | Playlist | Artist) => void;
}

export default function Search({ token, handleAdd }: Props) {
    const mounted = useRef(false)
    const [query, setQuery] = useState("")
    const [trackList, setTrackList] = useState<Track[]>([])
    const [artistList, setArtistList] = useState<Artist[]>([])
    const [playlistList, setPlaylistList] = useState<Playlist[]>([])
    const [albumList, setAlbumList] = useState<Album[]>([])
    const [expanded, setExpanded] = useState(false)
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
        null
    )

    const handleSearchRequest = () => {

        axios
            .get("http://localhost:8080/search", {
                params: { query },
                headers: { token },
            })
            .then(function (response) {
                setTrackList(response.data.tracks.results)
                setAlbumList(response.data.albums.results)
                setArtistList(response.data.artists.results)
                setPlaylistList(response.data.playlists.results)
            })
            .catch((error) => {
                console.log("Request failed", error);
            });
    };

    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
        } else {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }

            // Set a timeout to execute the search after 2 seconds
            const timeout = setTimeout(() => {
                handleSearchRequest();
            }, 2000);

            // Save the timeout ID for cleanup
            setSearchTimeout(timeout);

            // Cleanup function to clear the timeout when component unmounts or when query changes
            return () => {
                if (searchTimeout) {
                    clearTimeout(searchTimeout);
                }
            }
        }
    }, [query])

    // ------------------- For local development
    const track: Track[] = [{
        name: "Austin",
        uri: "spotify:track:4NJqhmkGN042BrvHoMKUrJ",
        artists: [
            {
                name: "Dasha",
                link: "https://api.spotify.com/v1/artists/7Ez6lTtSMjMf2YSYpukP1I"
            }
        ],
        album: {
            name: "Austin",
            link: "https://api.spotify.com/v1/albums/4JtlZzYJEa7bejLF0ASnk0"
        },
        duration_ms: 171782
    }]

    const album: Album[] = [{
        name: "The Catalyst",
        uri: "spotify:album:0Rfiyvva6juwbWHRApI5Hj",
        artists: [
            {
                name: "Amaranthe",
                link: "https://api.spotify.com/v1/artists/2KaW48xlLnXC2v8tvyhWsa"
            }
        ],
        year: 2024,
        icon_link: "https://i.scdn.co/image/ab67616d0000b273f73682a00d49786b8c743cfd"
    }]

    const artist: Artist[] = [{
        name: "ABBA",
        uri: "spotify:artist:0LcJLqbBmaGUft1e9Mm8HV",
        icon_link: "https://i.scdn.co/image/ab6761610000e5eb124eba6bf3476404531bd7b2"
    }]

    const playlist: Playlist[] = [{
        name: "ABBA: Best Of The Best",
        uri: "spotify:playlist:1uNj91vKo7JPMaTP6CpU6F",
        icon_link: "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000bebbd3e8b10c2b93e3b179c88c1a"
    }]

    useEffect(() => {
        setTrackList(track)
        setAlbumList(album)
        setArtistList(artist)
        setPlaylistList(playlist)
    }, [])
    // ------------------- For local development

    return (
        <Box sx={{
            bgcolor: 'secondary.dark',
            flex: 3,
            padding: 1,
            borderRadius: 3,
            boxShadow: 2,
            display: 'flex'
        }}>
            <Stack>
                <Box sx={{
                    display: 'flex',
                    width: 1
                }}>
                    <CollapseIconButton expanded={expanded} setExpanded={setExpanded} />
                    <SearchInput setQuery={setQuery} />
                </Box>
                <Box sx={{
                    display: 'flex',
                    width: 1
                }}>
                    {expanded &&
                        <ExpandedSearchContent
                            trackList={trackList}
                            albumList={albumList}
                            playlistList={playlistList}
                            artistList={artistList}
                            handleAdd={handleAdd} />
                    }
                </Box>
            </Stack>
        </Box>
    );
}
