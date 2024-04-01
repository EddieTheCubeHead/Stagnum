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
    setSearchResults: (data: any) => void
}

export default function Search({ token, updatePool, expanded, toggleExpanded, setSearchResults }: Props) {
    const mounted = useRef(false)
    const [query, setQuery] = useState("")
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
                setSearchResults(response.data)
            })
            .catch((error) => {
                console.log("Request failed", error);
            });
    };

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

    return (
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
            <CollapseIconButton expanded={expanded} handleExpandClick={handleExpandClick} />
            <SearchInput setQuery={setQuery} />
        </Box>
    );
}
