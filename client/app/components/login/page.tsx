'use client'

import axios from 'axios'
import { redirect, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Box, Button, Link, Typography } from '@mui/material'

export default function Login() {
  const router = useRouter()

  const handleLoginRequest = () => {
    console.log('Sending login request')
    const client_redirect_uri = 'http://localhost:80'

    axios
      .get('http://localhost:8080/auth/login', { params: { client_redirect_uri } })
      .then(function (response) {
        console.log(response.data.redirect_uri)
        router.push(response.data.redirect_uri)
      })
      .catch(() => {
        console.log('Request failed')
      })
  }

  return (
    <main className='relative min-h-screen w-full h-full flex px-36'>
      <Link href='/' className=' pt-4 w-full z-10'>
        <Typography className='text-3xl font-semibold text-[#1ED760]'>Stagnum</Typography>
      </Link>
      <Box className='top-0 left-0 w-full h-full absolute flex'>
        <Image
          src={require('@/public/homeBG.jpg')}
          fill
          alt={'Home background'}
        />
      </Box>
      <Box
        className='flex text-black z-10 w-full h-full min-h-screen justify-center items-center flex-col
       gap-4'
      >
        <Typography className='text-xl text-black'>Login with your Spotify</Typography>

        <Button
          className='bg-[#1ED760] py-2 w-36 rounded-full text-xl font-semibold'
          onClick={handleLoginRequest}
        >
          Login
        </Button>

        <Box className='flex gap-4'>
          <Link href='/about'>About Stagnum</Link>
          <Link
            href='https://github.com/EddieTheCubeHead/Stagnum/discussions'
            className='text-[#1ED760]'
            target='_blank'
          >
            Contact Us
          </Link>
        </Box>
      </Box>
    </main>
  )
}
