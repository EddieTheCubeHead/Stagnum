import theme from "@/utils/theme";
import Track from "@/types/trackTypes";
import { Box, Card, Grid, TextField, ThemeProvider, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Header3, Text } from "../textComponents";
import DefaultButton from "../buttons/defaulButton";

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
                name: 'Antti Tuisku',
                link: 'https://api.spotify.com/v1/artists/54CMkgIraCOO9pSRfPKiKt'
            },
            {
                name: "Käärijä",
                link: "https://api.spotify.com/v1/artists/6LkMGN0t3HDNL8hIvma70r"
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
                bgcolor: theme.palette.secondary.dark,
                width: 'auto',
                height: 'auto',
                borderRadius: 3,
                boxShadow: 2
            }}>
                <TextField
                    sx={{
                        bgcolor: theme.palette.secondary.main,
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
                <Grid container spacing={1} columns={10} sx={{ padding: 1 }}>
                    {trackList.map((track, key) => (
                        <Grid item xs={2} key={key}>
                            <Box style={{
                                position: 'relative',
                                width: '100%',
                                paddingTop: '100%',
                            }}>
                                <Card sx={{
                                    backgroundColor: theme.palette.secondary.main,
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                }}>
                                    <Header3 text={track.name} />
                                    <DefaultButton text={"Play"} action={() => { }} />
                                </Card>
                            </Box>
                        </Grid>
                    ))}
                </Grid>

            </Box>
        </Grid>
    )
}