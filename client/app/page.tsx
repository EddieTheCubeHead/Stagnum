'use client'

import Footer from '@/components/layout/Footer'
import SideMenu from '@/components/layout/SideMenu'
import stagnumTheme from '@/services/stagnumTheme'
import theme from '@/services/stagnumTheme'
import { Box, Grid, TextField, ThemeProvider } from '@mui/material'
import axios from 'axios'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}

function HomeContent() {
  const [showSearchBar, setShowSearchBar] = useState(false)
  const [token, setToken] = useState('')
  const [query, setQuery] = useState('')
  const queryParams = useSearchParams()
  const code = queryParams.get('code')
  const state = queryParams.get('state')
  const client_redirect_uri = 'http://localhost:80'

  useEffect(() => {
    if (code && state) {
      handleTokenRequest(code, state)
    }
  }, [])

  useEffect(() => {
    handleSearchRequest(query)
  }, [query])

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

  const handleTokenRequest = (code: string, state: string) => {
    console.log('Sending play request')

    axios.get('http://localhost:8080/auth/login/callback',
      { params: { state, code, client_redirect_uri } })
      .then(function (response) {
        console.log(response)
        setToken(response.data.access_token)
      }).catch((error) => {
        console.log('Request failed', error)
      })
  }

  return (
    <ThemeProvider theme={theme}>
      <Box>
        <Grid container spacing={1} sx={{
          bgcolor: stagnumTheme.palette.primary.dark,
        }}>

          <Grid item xs={3}>
            <SideMenu setShowSearchBar={setShowSearchBar} showSearchBar={showSearchBar} />
          </Grid>

          <Grid item xs={9}>
            <Box sx={{
              bgcolor: theme.palette.primary.main,
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

        </Grid>
      </Box>
      <Footer />
    </ThemeProvider>
  )
}
