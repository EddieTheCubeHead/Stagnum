import Track from "@/types/trackTypes";
import { Box, Collapse } from "@mui/material";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import SearchInput from "../inputfields.tsx/searchInput"
import Playlist from '@/types/playlistTypes'
import Album from "@/types/albumTypes"
import Artist from "@/types/artistTypes"
//import CollapseIconButton from "../buttons/iconButtons/collapseIconButton";
import ExpandedSearchContent from "./expandedSearchContent";
import CollapseIconButton from "../buttons/iconButtons/collapseIconButton";

interface Props {
    token: string
    updatePool: (pool: Pool) => void
    expanded: boolean
    toggleExpanded: () => void
}

export default function Search({ token, updatePool, expanded, toggleExpanded }: Props) {
    const mounted = useRef(false)
    const [query, setQuery] = useState("")
    const [trackList, setTrackList] = useState<Track[]>([])
    const [artistList, setArtistList] = useState<Artist[]>([])
    const [playlistList, setPlaylistList] = useState<Playlist[]>([])
    const [albumList, setAlbumList] = useState<Album[]>([])
    const [disabled, setDisabled] = useState(true)
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
                if (expanded) {
                    toggleExpanded()
                }
                setTrackList(response.data.tracks.results)
                setAlbumList(response.data.albums.results)
                setArtistList(response.data.artists.results)
                setPlaylistList(response.data.playlists.results)
            })
            .catch((error) => {
                console.log("Request failed", error);
            });
    };

    const enableAddbutton = () => {
        setDisabled(false)
    }

    const handleExpandClick = () => {
        toggleExpanded()
    }

    // useEffect to only execute search request after one second has passed from the last input
    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
        } else {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }

            const timeout = setTimeout(() => {
                handleSearchRequest();
            }, 1000);

            setSearchTimeout(timeout);

            // Cleanup function to clear the timeout when component unmounts or when query changes
            return () => {
                if (searchTimeout) {
                    clearTimeout(searchTimeout);
                }
            };
        }
    }, [query]);

    const tracks: Track[] = [
        {
            "name": "The Last Stand",
            "link": "https://api.spotify.com/v1/tracks/0bUgTRe5st6TMbRCEjKezX",
            "uri": "spotify:track:0bUgTRe5st6TMbRCEjKezX",
            "artists": [
                {
                    "name": "Sabaton",
                    "link": "https://api.spotify.com/v1/artists/3o2dn2O0FCVsWDFSh8qxgG"
                }
            ],
            "album": {
                "name": "The Last Stand",
                "link": "https://api.spotify.com/v1/albums/14OgR04PHXULz1svvsol8L",
                "uri": "spotify:album:14OgR04PHXULz1svvsol8L",
                "artists": [
                    {
                        "name": "Sabaton",
                        "link": "https://api.spotify.com/v1/artists/3o2dn2O0FCVsWDFSh8qxgG"
                    }
                ],
                "year": 2016,
                "icon_link": "https://i.scdn.co/image/ab67616d0000b2730c100c40bdedea776770e7aa"
            },
            "duration_ms": 235840
        },
        {
            "name": "Last Ride of the Day",
            "link": "https://api.spotify.com/v1/tracks/6R9j9XEisGCoIE8r8UtbiS",
            "uri": "spotify:track:6R9j9XEisGCoIE8r8UtbiS",
            "artists": [
                {
                    "name": "Nightwish",
                    "link": "https://api.spotify.com/v1/artists/2NPduAUeLVsfIauhRwuft1"
                }
            ],
            "album": {
                "name": "Imaginaerum",
                "link": "https://api.spotify.com/v1/albums/7lUxbRgHGomu4raRe59qTK",
                "uri": "spotify:album:7lUxbRgHGomu4raRe59qTK",
                "artists": [
                    {
                        "name": "Nightwish",
                        "link": "https://api.spotify.com/v1/artists/2NPduAUeLVsfIauhRwuft1"
                    }
                ],
                "year": 2011,
                "icon_link": "https://i.scdn.co/image/ab67616d0000b273dbfe9a51b813ddc881d21dce"
            },
            "duration_ms": 271120
        },
        {
            "name": "Last Resort",
            "link": "https://api.spotify.com/v1/tracks/5W8YXBz9MTIDyrpYaCg2Ky",
            "uri": "spotify:track:5W8YXBz9MTIDyrpYaCg2Ky",
            "artists": [
                {
                    "name": "Papa Roach",
                    "link": "https://api.spotify.com/v1/artists/4RddZ3iHvSpGV4dvATac9X"
                }
            ],
            "album": {
                "name": "Infest",
                "link": "https://api.spotify.com/v1/albums/0BHa0ePkvGAVKymB4FU58m",
                "uri": "spotify:album:0BHa0ePkvGAVKymB4FU58m",
                "artists": [
                    {
                        "name": "Papa Roach",
                        "link": "https://api.spotify.com/v1/artists/4RddZ3iHvSpGV4dvATac9X"
                    }
                ],
                "year": 2001,
                "icon_link": "https://i.scdn.co/image/ab67616d0000b273985bf5ede2fe4a048ee85f28"
            },
            "duration_ms": 199906
        },
        {
            "name": "Last Dying Breath",
            "link": "https://api.spotify.com/v1/tracks/2Jfa2DHtIkXivUhW5kNoWL",
            "uri": "spotify:track:2Jfa2DHtIkXivUhW5kNoWL",
            "artists": [
                {
                    "name": "Sabaton",
                    "link": "https://api.spotify.com/v1/artists/3o2dn2O0FCVsWDFSh8qxgG"
                }
            ],
            "album": {
                "name": "Heroes of the Great War",
                "link": "https://api.spotify.com/v1/albums/696U87mT1ALlc1X8Ayu6Tv",
                "uri": "spotify:album:696U87mT1ALlc1X8Ayu6Tv",
                "artists": [
                    {
                        "name": "Sabaton",
                        "link": "https://api.spotify.com/v1/artists/3o2dn2O0FCVsWDFSh8qxgG"
                    }
                ],
                "year": 2023,
                "icon_link": "https://i.scdn.co/image/ab67616d0000b27349929a46ad599b559b48a355"
            },
            "duration_ms": 202400
        }
    ]
    const albums: Album[] = [
        {
            "name": "The Last of Us",
            "link": "https://api.spotify.com/v1/albums/2GFFxj8aR2XpwIMYanOPjh",
            "uri": "spotify:album:2GFFxj8aR2XpwIMYanOPjh",
            "artists": [
                {
                    "name": "Gustavo Santaolalla",
                    "link": "https://api.spotify.com/v1/artists/4W3fa7tiXGVXl3KilbACqt"
                }
            ],
            "year": 2013,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b27368e5e7cc9256ca8c0917a9dd"
        },
        {
            "name": "LAST",
            "link": "https://api.spotify.com/v1/albums/5ctazksNQbauHpKELQCjHP",
            "uri": "spotify:album:5ctazksNQbauHpKELQCjHP",
            "artists": [
                {
                    "name": "Andrew Marshall",
                    "link": "https://api.spotify.com/v1/artists/3tFWXCmBpKg0k8MfNCrVsX"
                }
            ],
            "year": 2024,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b2734fd46e8a85490f36ccddb0c3"
        },
        {
            "name": "Last of the Mohicans (Original Motion Picture Soundtrack)",
            "link": "https://api.spotify.com/v1/albums/3msCAE2EZOM94uyivazQN8",
            "uri": "spotify:album:3msCAE2EZOM94uyivazQN8",
            "artists": [
                {
                    "name": "Trevor Jones",
                    "link": "https://api.spotify.com/v1/artists/5928hF4c1MriHfAgpFf8ya"
                }
            ],
            "year": 1992,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b273cca476b01136077b6d966aa6"
        },
        {
            "name": "Last of the Mohicans (Original Motion Picture Soundtrack)",
            "link": "https://api.spotify.com/v1/albums/3msCAE2EZOM94uyivazQN8",
            "uri": "spotify:album:3msCAE2EZOM94uyivazQN8",
            "artists": [
                {
                    "name": "Trevor Jones",
                    "link": "https://api.spotify.com/v1/artists/5928hF4c1MriHfAgpFf8ya"
                }
            ],
            "year": 1992,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b273cca476b01136077b6d966aa6"
        }
    ]
    const artists: Artist[] = [
        {
            "name": "Livingston",
            "link": "https://api.spotify.com/v1/artists/2fPsJqR6zfoHatC1eFr0eQ",
            "uri": "spotify:artist:2fPsJqR6zfoHatC1eFr0eQ",
            "icon_link": "https://i.scdn.co/image/ab6761610000e5ebadc0e7196be31ac8fb4f6cbc"
        },
        {
            "name": "The Last Dinner Party",
            "link": "https://api.spotify.com/v1/artists/5SHgclK1ZpTdfdAmXW7J6s",
            "uri": "spotify:artist:5SHgclK1ZpTdfdAmXW7J6s",
            "icon_link": "https://i.scdn.co/image/ab6761610000e5eb33071d72963677936f4f5310"
        },
        {
            "name": "LASTOUT",
            "link": "https://api.spotify.com/v1/artists/7vQfNVb9azE2sgkWDOCUd2",
            "uri": "spotify:artist:7vQfNVb9azE2sgkWDOCUd2",
            "icon_link": "https://i.scdn.co/image/ab6761610000e5eb577be6b2c490cbe4a328cb5e"
        },
        {
            "name": "Hevisaurus",
            "link": "https://api.spotify.com/v1/artists/04wwRPFGcvENSA7EIQBJwC",
            "uri": "spotify:artist:04wwRPFGcvENSA7EIQBJwC",
            "icon_link": "https://i.scdn.co/image/f49de734c066d45b273cc6b982f9ddff9dc1d530"
        }
    ]

    const playlists: Playlist[] = [
        {
            name: "Iloisia lastenlauluja",
            link: "https://api.spotify.com/v1/playlists/1a83wHM0zr4o2oXbfcZb1y",
            uri: "spotify:playlist:1a83wHM0zr4o2oXbfcZb1y",
            icon_link: "https://mosaic.scdn.co/640/ab67616d0000b2738774a5956228479b6fd83e0bab67616d0000b273c82ba78161dc4aba4b18e58bab67616d0000b273d307b171fdbbd2513f83b78dab67616d0000b273ea4a5e4408cc427634efe62d"
        },
        {
            name: "Lasten disco 2023",
            link: "https://api.spotify.com/v1/playlists/14NN0oVpshLpUdvkXn4DVN",
            uri: "spotify: playlist: 14NN0oVpshLpUdvkXn4DVN",
            icon_link: "https://mosaic.scdn.co/640/ab67616d0000b27368a5d53cf8b39786ed958560ab67616d0000b27384debf909c4e2a402288210aab67616d0000b273a07a46058ec0af2d56a213d2ab67616d0000b273e9973a2290bd5d88c6aad387"
        },
        {
            name: "Lasten Disco 2024",
            link: "https://api.spotify.com/v1/playlists/6ksjkhqES1NIPjoGXiHI62",
            uri: "spotify:playlist:6ksjkhqES1NIPjoGXiHI62",
            icon_link: "https://mosaic.scdn.co/640/ab67616d0000b27368a5d53cf8b39786ed958560ab67616d0000b2736cfc57e5358c5e39e79bccbdab67616d0000b2737c6359afd593be636f81be71ab67616d0000b273e9973a2290bd5d88c6aad387"
        },
        {
            name: "Lasten Disko 2024 | Windows95Man - UMK | Zoomerang Suomi | TikTok Suomi | Disney Suomi",
            link: "https://api.spotify.com/v1/playlists/7oDqUI2J92gqUGWoqNKIYD",
            uri: "spotify:playlist:7oDqUI2J92gqUGWoqNKIYD",
            icon_link: "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000bebb64c38a9323cea9727bdfcd74"
        },
    ]


    useEffect(() => {
        setTrackList(tracks)
        setAlbumList(albums)
        setPlaylistList(playlists)
        setArtistList(artists)
    }, [])

    return (
        <Box sx={{
        }}>
            <Box sx={{
                display: 'flex',
                width: 1,
                bgcolor: 'secondary.dark',
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                borderBottomLeftRadius: expanded ? 12 : 0,
                borderBottomRightRadius: expanded ? 12 : 0,
                boxShadow: 2,
            }}>
                <CollapseIconButton expanded={expanded} handleExpandClick={handleExpandClick} />
                <SearchInput setQuery={setQuery} />
            </Box>
            <Collapse in={!expanded} sx={{
                width: 1,
                overflow: 'auto',
                bgcolor: 'secondary.dark',
                borderBottomLeftRadius: 12,
                borderBottomRightRadius: 12,
            }}>
                <Box sx={{
                    display: 'flex',
                }}>
                    <ExpandedSearchContent
                        trackList={trackList}
                        albumList={albumList}
                        playlistList={playlistList}
                        artistList={artistList}
                        updatePool={updatePool}
                        token={token}
                        disabled={disabled}
                        enableAddButton={enableAddbutton}
                    />
                </Box>
            </Collapse>
        </Box>
    );
}
