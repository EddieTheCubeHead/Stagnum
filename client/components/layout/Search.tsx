import stagnumTheme from "@/theme/stagnumTheme";
import { Box, Grid, TextField, ThemeProvider } from "@mui/material";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

type Props = {
    token: string
    showSearchBar: boolean
}

export default function Search({ token, showSearchBar }: Props) {
    const mounted = useRef(false);
    const [query, setQuery] = useState('')

    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    const handleSearchRequest = (searchQuery: string) => {
        console.log('Searching song with:', searchQuery)

        axios.get('http://localhost:8080/search/tracks',
            {
                params: { query },
                headers: { token }
            })
            .then(function (response) {
                console.log(response)
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
            }, 2000);

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
                bgcolor: stagnumTheme.palette.primary.main,
                width: 'auto',
                height: 800,
                borderRadius: 3,
                boxShadow: 2
            }}>
                {showSearchBar == true &&
                    <TextField
                        sx={{
                            bgcolor: stagnumTheme.palette.primary.light,
                            margin: 1,
                            width: 500,
                            borderRadius: 3,
                            boxShadow: 2
                        }}
                        id='standard-search'
                        label='Search field'
                        type='search'
                        onChange={(e) => setQuery(e.target.value)}
                    />
                }
            </Box>
        </Grid>
    )
}