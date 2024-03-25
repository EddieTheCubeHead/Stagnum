import Track from "@/types/trackTypes";
import { AppBar, Box, Collapse, Stack } from "@mui/material";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import SearchInput from "../inputfields.tsx/searchInput"
import Playlist from '@/types/playlistTypes'
import Album from "@/types/albumTypes"
import Artist from "@/types/artistTypes"
import CollapseIconButton from "../buttons/iconButtons/collapseIconButton";
import ExpandedSearchContent from "./expandedSearchContent";

interface Props {
    token: string;
    handleAdd: (newAdd: Track | Album | Playlist | Artist) => void;
}

export default function Search({ token, handleAdd, }: Props) {
    const mounted = useRef(false)
    const [query, setQuery] = useState("")
    const [trackList, setTrackList] = useState<Track[]>([])
    const [artistList, setArtistList] = useState<Artist[]>([])
    const [playlistList, setPlaylistList] = useState<Playlist[]>([])
    const [albumList, setAlbumList] = useState<Album[]>([])
    const [expanded, setExpanded] = useState(false)
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
                if (!expanded) {
                    setExpanded(true)
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

            return () => {
                if (searchTimeout) {
                    clearTimeout(searchTimeout);
                }
            }
        }
    }, [query])

    return (
        <Box sx={{
            flex: 3,
            padding: 1,
            display: 'flex',
            flexDirection: 'column',
        }}>
            <Box sx={{
                display: 'flex',
                width: 1,
                bgcolor: 'secondary.dark',
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                borderBottomLeftRadius: expanded ? 0 : 12,
                borderBottomRightRadius: expanded ? 0 : 12,
                boxShadow: 2,
            }}>
                <CollapseIconButton expanded={expanded} setExpanded={setExpanded} />
                <SearchInput setQuery={setQuery} />
            </Box>
            <Collapse in={expanded} sx={{
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
                        handleAdd={handleAdd}
                        token={token}
                        disabled={disabled}
                        enableAddButton={enableAddbutton}
                    />
                </Box>
            </Collapse>
        </Box>
    );
}
