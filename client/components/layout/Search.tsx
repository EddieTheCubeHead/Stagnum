import stagnumTheme from "@/theme/stagnumTheme";
import Track from "@/types/trackTypes";
import { Box, Card, Grid, TextField, ThemeProvider, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

interface Props {
    token: string
}

export default function Search({ token }: Props) {
    const mounted = useRef(false);
    const [query, setQuery] = useState('')
    const [trackList, setTrackList] = useState<Track[]>([{
        name: 'Auto jää (feat. Käärijä)',
        uri: 'spotify:track:3rsDUslPzGw6sGHjkM4lg2',
        artists: [
            {
                name: 'https://api.spotify.com/v1/artists/54CMkgIraCOO9pSRfPKiKt',
                link: 'Antti Tuisku'
            }
        ],
        album: {
            name: 'Auto jää (feat. Käärijä)',
            link: 'https://api.spotify.com/v1/albums/68VvJB0YdL5CIwTd7c3gag'
        },
        duration_ms: 172087
    }])

    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

    const handleSearchRequest = (searchQuery: string) => {
        console.log('Searching song with:', searchQuery)

        axios.get('http://localhost:8080/search/tracks',
            {
                params: { query },
                headers: { token }
            })
            .then(function (response) {
                console.log(response)
                setTrackList(response.data.results)
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
                height: 'auto',
                borderRadius: 3,
                boxShadow: 2
            }}>
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
                <Grid container spacing={1} sx={{
                    padding: 1
                }}>
                    {trackList.map((track, key) => (
                        <Grid item xs={2} key={key} columns={10}>
                            <Card sx={{
                                backgroundColor: 'white',
                                height: 100
                            }}>
                                <Typography fontSize={18} color="initial">{track.name}</Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Grid>
    )
}