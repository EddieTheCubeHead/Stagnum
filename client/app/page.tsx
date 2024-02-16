'use client'

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
  const [token, setToken] = useState('')

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
    console.log('Token:', token)
  }, [token])

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
    <main>
      <ThemeProvider theme={theme}>
        <Box sx={{ bgcolor: theme.palette.primary.light }} className="relative min-h-screen flex flex-col w-full h-full">

          <Box sx={{ bgcolor: theme.palette.primary.main }} className="fixed flex flex-col h-full px-12 py-16 w-96">
            <List>
              <ListItemButton sx={{}} onClick={() => setShowSearchBar(!showSearchBar)}>
                <ListItemText>Search</ListItemText>
              </ListItemButton>
            </List>
          </Box>

          <Box className="relative flex flex-col h-full ml-96">
            <Avatar sx={{ margin: 2 }} className="absolute right-0 h-20 w-20" >My Profile</Avatar>
            <Box sx={{}}>
              {showSearchBar == true &&
                <TextField
                  sx={{ margin: 4, width: 500 }}
                  id="standard-search"
                  label="Search field"
                  type="search"
                  variant="standard"
                />
              }
            </Box>
            <Box sx={{ bgcolor: theme.palette.primary.dark }} className="fixed bottom-0 left-0 w-full py-4 px-12 flex">
              <Box className="flex gap-4 w-96">
                <Link href="/about">About Stagnum</Link>
                <Link
                  href="https://github.com/EddieTheCubeHead/Stagnum/discussions"
                  target="_blank"
                  className="text-[#1ED760]"
                >
                  Contact Us
                </Link>
              </Box>
              <Typography>Media Player</Typography>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </main >
  );
}
