import Track from "@/types/trackTypes";
import { Box, Collapse, Stack } from "@mui/material";
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

    const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI

    const handleSearchRequest = () => {

        axios
            .get(`${backend_uri}/search`, {
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
    const track: Track[] = [
        {
            "name": "Austin",
            "link": "https://api.spotify.com/v1/tracks/4NJqhmkGN042BrvHoMKUrJ",
            "uri": "spotify:track:4NJqhmkGN042BrvHoMKUrJ",
            "artists": [
                {
                    "name": "Dasha",
                    "link": "https://api.spotify.com/v1/artists/7Ez6lTtSMjMf2YSYpukP1I"
                }
            ],
            "album": {
                "name": "Austin",
                "link": "https://api.spotify.com/v1/albums/4JtlZzYJEa7bejLF0ASnk0",
                "uri": "spotify:album:4JtlZzYJEa7bejLF0ASnk0",
                "artists": [
                    {
                        "name": "Dasha",
                        "link": "https://api.spotify.com/v1/artists/7Ez6lTtSMjMf2YSYpukP1I"
                    }
                ],
                "year": 2023,
                "icon_link": "https://i.scdn.co/image/ab67616d0000b273a73f6a4f17c58becc885efe2"
            },
            "duration_ms": 171782
        },
        {
            "name": "Lay All Your Love On Me",
            "link": "https://api.spotify.com/v1/tracks/4euAGZTszWPrriggYK0HG9",
            "uri": "spotify:track:4euAGZTszWPrriggYK0HG9",
            "artists": [
                {
                    "name": "ABBA",
                    "link": "https://api.spotify.com/v1/artists/0LcJLqbBmaGUft1e9Mm8HV"
                }
            ],
            "album": {
                "name": "Super Trouper",
                "link": "https://api.spotify.com/v1/albums/3ZdkT5buYFi1WQaB0XNNtf",
                "uri": "spotify:album:3ZdkT5buYFi1WQaB0XNNtf",
                "artists": [
                    {
                        "name": "ABBA",
                        "link": "https://api.spotify.com/v1/artists/0LcJLqbBmaGUft1e9Mm8HV"
                    }
                ],
                "year": 1980,
                "icon_link": "https://i.scdn.co/image/ab67616d0000b2734d08fc99eff4ed52dfce91fa"
            },
            "duration_ms": 274466
        },
        {
            "name": "Gimme! Gimme! Gimme! (A Man After Midnight)",
            "link": "https://api.spotify.com/v1/tracks/3vkQ5DAB1qQMYO4Mr9zJN6",
            "uri": "spotify:track:3vkQ5DAB1qQMYO4Mr9zJN6",
            "artists": [
                {
                    "name": "ABBA",
                    "link": "https://api.spotify.com/v1/artists/0LcJLqbBmaGUft1e9Mm8HV"
                }
            ],
            "album": {
                "name": "Voulez-Vous",
                "link": "https://api.spotify.com/v1/albums/7iLuHJkrb9KHPkMgddYigh",
                "uri": "spotify:album:7iLuHJkrb9KHPkMgddYigh",
                "artists": [
                    {
                        "name": "ABBA",
                        "link": "https://api.spotify.com/v1/artists/0LcJLqbBmaGUft1e9Mm8HV"
                    }
                ],
                "year": 1979,
                "icon_link": "https://i.scdn.co/image/ab67616d0000b273aa22899360d8ba6704732dec"
            },
            "duration_ms": 292613
        },
        {
            "name": "Another Love",
            "link": "https://api.spotify.com/v1/tracks/3JvKfv6T31zO0ini8iNItO",
            "uri": "spotify:track:3JvKfv6T31zO0ini8iNItO",
            "artists": [
                {
                    "name": "Tom Odell",
                    "link": "https://api.spotify.com/v1/artists/2txHhyCwHjUEpJjWrEyqyX"
                }
            ],
            "album": {
                "name": "Long Way Down (Deluxe)",
                "link": "https://api.spotify.com/v1/albums/0Gf1yE895FKK4YWVRuAeg8",
                "uri": "spotify:album:0Gf1yE895FKK4YWVRuAeg8",
                "artists": [
                    {
                        "name": "Tom Odell",
                        "link": "https://api.spotify.com/v1/artists/2txHhyCwHjUEpJjWrEyqyX"
                    }
                ],
                "year": 2013,
                "icon_link": "https://i.scdn.co/image/ab67616d0000b2731917a0f3f4152622a040913f"
            },
            "duration_ms": 244360
        },
        {
            "name": "Dancing Queen",
            "link": "https://api.spotify.com/v1/tracks/0GjEhVFGZW8afUYGChu3Rr",
            "uri": "spotify:track:0GjEhVFGZW8afUYGChu3Rr",
            "artists": [
                {
                    "name": "ABBA",
                    "link": "https://api.spotify.com/v1/artists/0LcJLqbBmaGUft1e9Mm8HV"
                }
            ],
            "album": {
                "name": "Arrival",
                "link": "https://api.spotify.com/v1/albums/1V6a99EbTTIegOhWoPxYI9",
                "uri": "spotify:album:1V6a99EbTTIegOhWoPxYI9",
                "artists": [
                    {
                        "name": "ABBA",
                        "link": "https://api.spotify.com/v1/artists/0LcJLqbBmaGUft1e9Mm8HV"
                    }
                ],
                "year": 1976,
                "icon_link": "https://i.scdn.co/image/ab67616d0000b27370f7a1b35d5165c85b95a0e0"
            },
            "duration_ms": 230400
        },
    ]

    const album: Album[] = [
        {
            "name": "The Catalyst",
            "link": "https://api.spotify.com/v1/albums/0Rfiyvva6juwbWHRApI5Hj",
            "uri": "spotify:album:0Rfiyvva6juwbWHRApI5Hj",
            "artists": [
                {
                    "name": "Amaranthe",
                    "link": "https://api.spotify.com/v1/artists/2KaW48xlLnXC2v8tvyhWsa"
                }
            ],
            "year": 2024,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b273f73682a00d49786b8c743cfd"
        },
        {
            "name": "AM",
            "link": "https://api.spotify.com/v1/albums/78bpIziExqiI9qztvNFlQu",
            "uri": "spotify:album:78bpIziExqiI9qztvNFlQu",
            "artists": [
                {
                    "name": "Arctic Monkeys",
                    "link": "https://api.spotify.com/v1/artists/7Ln80lUS6He07XvHI8qqHH"
                }
            ],
            "year": 2013,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b2734ae1c4c5c45aabe565499163"
        },
        {
            "name": "Super Trouper",
            "link": "https://api.spotify.com/v1/albums/3ZdkT5buYFi1WQaB0XNNtf",
            "uri": "spotify:album:3ZdkT5buYFi1WQaB0XNNtf",
            "artists": [
                {
                    "name": "ABBA",
                    "link": "https://api.spotify.com/v1/artists/0LcJLqbBmaGUft1e9Mm8HV"
                }
            ],
            "year": 1980,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b2734d08fc99eff4ed52dfce91fa"
        },
        {
            "name": "Voulez-Vous",
            "link": "https://api.spotify.com/v1/albums/7iLuHJkrb9KHPkMgddYigh",
            "uri": "spotify:album:7iLuHJkrb9KHPkMgddYigh",
            "artists": [
                {
                    "name": "ABBA",
                    "link": "https://api.spotify.com/v1/artists/0LcJLqbBmaGUft1e9Mm8HV"
                }
            ],
            "year": 1979,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b273aa22899360d8ba6704732dec"
        },
        {
            "name": "Arrival",
            "link": "https://api.spotify.com/v1/albums/1V6a99EbTTIegOhWoPxYI9",
            "uri": "spotify:album:1V6a99EbTTIegOhWoPxYI9",
            "artists": [
                {
                    "name": "ABBA",
                    "link": "https://api.spotify.com/v1/artists/0LcJLqbBmaGUft1e9Mm8HV"
                }
            ],
            "year": 1976,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b27370f7a1b35d5165c85b95a0e0"
        },
    ]

    const artist: Artist[] = [
        {
            "name": "AC/DC",
            "link": "https://api.spotify.com/v1/artists/711MCceyCBcFnzjGY4Q7Un",
            "uri": "spotify:artist:711MCceyCBcFnzjGY4Q7Un",
            "icon_link": "https://i.scdn.co/image/ab6761610000e5ebc4c77549095c86acb4e77b37"
        },
        {
            "name": "ABBA",
            "link": "https://api.spotify.com/v1/artists/0LcJLqbBmaGUft1e9Mm8HV",
            "uri": "spotify:artist:0LcJLqbBmaGUft1e9Mm8HV",
            "icon_link": "https://i.scdn.co/image/ab6761610000e5eb124eba6bf3476404531bd7b2"
        },
        {
            "name": "Amaranthe",
            "link": "https://api.spotify.com/v1/artists/2KaW48xlLnXC2v8tvyhWsa",
            "uri": "spotify:artist:2KaW48xlLnXC2v8tvyhWsa",
            "icon_link": "https://i.scdn.co/image/ab6761610000e5eb293f7f4aebb31292f607bf3b"
        },
        {
            "name": "Apulanta",
            "link": "https://api.spotify.com/v1/artists/5kwthnxNdfnqGk0nL35wDC",
            "uri": "spotify:artist:5kwthnxNdfnqGk0nL35wDC",
            "icon_link": "https://i.scdn.co/image/ab6761610000e5eb9c726630964d9ca3cbb56d59"
        },
        {
            "name": "Apocalyptica",
            "link": "https://api.spotify.com/v1/artists/4Lm0pUvmisUHMdoky5ch2I",
            "uri": "spotify:artist:4Lm0pUvmisUHMdoky5ch2I",
            "icon_link": "https://i.scdn.co/image/ab6761610000e5ebd5b5240aa1e0454e3ea2eb72"
        },
    ]

    const playlist: Playlist[] = [
        {
            "name": "AC/DC – Greatest Hits",
            "link": "https://api.spotify.com/v1/playlists/0wTrfNrOLJnH8XJed32zaE",
            "uri": "spotify:playlist:0wTrfNrOLJnH8XJed32zaE",
            "icon_link": "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000bebb580ae2312e0f2751cad23b24"
        },
        {
            "name": "ABBA: Best Of The Best",
            "link": "https://api.spotify.com/v1/playlists/1uNj91vKo7JPMaTP6CpU6F",
            "uri": "spotify:playlist:1uNj91vKo7JPMaTP6CpU6F",
            "icon_link": "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000bebbd3e8b10c2b93e3b179c88c1a"
        },
        {
            "name": "ABBA Gold: Greatest Hits",
            "link": "https://api.spotify.com/v1/playlists/5FAJg17Von0Mc8jkHUJQDf",
            "uri": "spotify:playlist:5FAJg17Von0Mc8jkHUJQDf",
            "icon_link": "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000bebb932bd2a9feb1bba5ff292382"
        },
        {
            "name": "This Is ABBA",
            "link": "https://api.spotify.com/v1/playlists/37i9dQZF1DZ06evO0nVzAk",
            "uri": "spotify:playlist:37i9dQZF1DZ06evO0nVzAk",
            "icon_link": "https://thisis-images.spotifycdn.com/37i9dQZF1DZ06evO0nVzAk-large.jpg"
        },
        {
            "name": "amispoppia😍",
            "link": "https://api.spotify.com/v1/playlists/6MIGmlQ5sTBHD0b4A71rzU",
            "uri": "spotify:playlist:6MIGmlQ5sTBHD0b4A71rzU",
            "icon_link": "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000bebb219af830eb68824d4b9df2a2"
        }
    ]

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
            display: 'flex',
        }}>
            <Stack sx={{
                width: 1
            }}>
                <Box sx={{
                    display: 'flex',
                    width: 1,
                }}>
                    <CollapseIconButton expanded={expanded} setExpanded={setExpanded} />
                    <SearchInput setQuery={setQuery} />
                </Box>
                <Box sx={{
                    display: 'flex',
                }}>
                    <Collapse in={expanded} sx={{
                        width: 1
                    }}>
                        <ExpandedSearchContent
                            trackList={trackList}
                            albumList={albumList}
                            playlistList={playlistList}
                            artistList={artistList}
                            handleAdd={handleAdd} />
                    </Collapse>
                </Box>
            </Stack>
        </Box>
    );
}
