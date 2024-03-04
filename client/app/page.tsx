'use client'

import axios from 'axios'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { ThemeProvider } from '@emotion/react'
import theme from "./utils/theme"

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
    <ThemeProvider theme={theme}>
    <main className='relative min-h-screen bg-white text-black flex flex-col w-full h-full'>
      <aside className='fixed flex flex-col bg-neutral-200 h-full px-12 py-16 w-96'>
        <ul className='flex flex-col gap-4'>
          <li>Home</li>
          <li>Search</li>
          <li>Create Pool</li>
          <li>Join Pool</li>
          <li>My Pool</li>
        </ul>
      </aside>
      <section className='relative flex flex-col h-full ml-96'>
        <button className='absolute right-12 h-24'>My Profile</button>
        <div className='fixed bg-black text-white bottom-0 left-0 w-full py-4 px-12 flex'>
          <div className='flex gap-4 w-96'>
            <a href='/about'>About Stagnum</a>
            <a
              href='https://github.com/EddieTheCubeHead/Stagnum/discussions'
              target='_blank'
              className='text-[#1ED760]'
            >
              Contact Us
            </a>
          </div>
          <p>Media Player</p>
        </div>
      </section>
    </main>
    </ThemeProvider>
  )
}
