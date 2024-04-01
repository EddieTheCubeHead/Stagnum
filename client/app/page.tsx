'use client'

import Footer from '@/components/layout/footer'
import SideMenu from '@/components/layout/sideMenu'
import { Box, CssBaseline, Grid, Stack } from '@mui/material'
import axios from 'axios'
import { useSearchParams, redirect } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { ThemeProvider } from '@emotion/react'
import theme from '../utils/theme'
import MainHeaderCard from '@/components/layout/mainHeaderCard'
import CreatePool from '@/components/layout/CreatePool'
import Album from '@/types/albumTypes'
import Footer from "@/components/layout/footer";
import { Box, CssBaseline, Grid, Stack } from "@mui/material";
import axios from "axios";
import { useSearchParams, redirect } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ThemeProvider } from "@emotion/react";
import theme from "../utils/theme";
import MainHeaderCard from "@/components/layout/mainHeaderCard";
import Album from "@/types/albumTypes";
import Artist from "@/types/artistTypes";
import Playlist from "@/types/playlistTypes";
import Track from "@/types/trackTypes";
import Search from "@/components/layout/search";
import ManagePool from "@/components/layout/managePool";
import '@/components/layout/css/customScrollBar.css';
import { Collections } from "@mui/icons-material";

export default function HomePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HomeContent />
        </Suspense>
    )
}

function HomeContent() {
    const [showSearchBar, setShowSearchBar] = useState(false)
    const [selectedCollections, setSellectedCollections] = useState<
        Array<Album>
    >([])
    const [token, setToken] = useState('')
    const queryParams = useSearchParams()
    const code = queryParams.get('code')
    const state = queryParams.get('state')
    const client_redirect_uri = process.env.NEXT_PUBLIC_FRONTEND_URI
    const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI

    useEffect(() => {
        if (code && state) {
            handleTokenRequest(code, state)
        }
        // Delete when we have an actual routeguard
        else {
            redirect('/login')
        }
    }, [])

    const handleTokenRequest = (code: string, state: string) => {
        console.log('Sending play request')

        axios
            .get(`${backend_uri}/auth/login/callback`, {
                params: { state, code, client_redirect_uri },
            })
            .then((response) => {
                setToken(response.data.access_token)
            })
            .catch((error) => {
                console.log('Request failed', error)
            })
    }

    const handleAdd = (newAdd: Album) => {
        setSellectedCollections((curCollections) => [...curCollections, newAdd])
    }

    const handleDelete = (itemToDelete: Album) => {
        setSellectedCollections((curCollections) =>
            curCollections.filter((collection) => collection !== itemToDelete),
        )
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
                sx={{
                    margin: 1,
                }}
            >
                <Grid container gap={1}>
                    <Grid item xs={4}>
                        <Stack spacing={1}>
                            <MainHeaderCard />
                            <SideMenu
                                setShowSearchBar={setShowSearchBar}
                                showSearchBar={showSearchBar}
                                token={token}
                                handleAdd={handleAdd}
                            />
                        </Stack>
                    </Grid>
                    <Grid item xs={7.9}>
                        <CreatePool
                            token={token}
                            selectedCollections={selectedCollections}
                            handleDelete={handleDelete}
                        />
                    </Grid>
                </Grid>
            </Box>
            <Footer token={token} />
        </ThemeProvider>
    )
}
