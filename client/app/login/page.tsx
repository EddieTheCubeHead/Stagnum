'use client'

import axios from 'axios'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Box, Link, Stack, Typography } from '@mui/material'
import DefaultButton from '@/components/buttons/defaulButton'
import { useState } from 'react'
import AlertComponent from '@/components/alertComponent'

const LoginPage: React.FC = () => {
    const [alert, setAlert] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const router = useRouter()

    const handleLoginRequest = (): void => {
        const client_redirect_uri = process.env.NEXT_PUBLIC_FRONTEND_URI
        const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI

        axios
            .get(`${backend_uri}/auth/login`, {
                params: { client_redirect_uri },
            })
            .then((response) => {
                localStorage.setItem(
                    'token',
                    response.config.headers.Authorization as string,
                )
                router.push(response.data.redirect_uri)
            })
            .catch((error) => {
                setErrorAlert(
                    `Login callback failed with error: ${error.response.data.detail}`,
                )
            })
    }

    const setErrorAlert = (message: string): void => {
        setErrorMessage(message)
        setAlert(true)
    }

    const closeAlert = (): void => {
        setAlert(false)
    }

    return (
        <Box
            width={'100%'}
            height={'100%'}
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'row-reverse',
                px: 18,
            }}
        >
            <Box justifyContent={'end'} display={'flex'} width={'100%'}>
                {/* <Typography className='text-3xl font-semibold text-[#1ED760]'>Stagnum</Typography> */}
            </Box>
            <Box
                display={'flex'}
                top={0}
                left={0}
                position={'absolute'}
                width={'100%'}
                height={'100%'}
            >
                <Image
                    src={require('@/public/homeBG.jpg')}
                    fill
                    alt={'Home background'}
                />
            </Box>
            <Box
                display={'flex'}
                width={'100%'}
                height={'100%'}
                justifyContent={'center'}
                alignItems={'center'}
                flexDirection={'column'}
                minHeight={'100vh'}
                zIndex={1}
                color={'white'}
                gap={2}
            >
                <Stack spacing={1} direction={'row'} alignItems={'end'} ml={42}>
                    <Typography fontSize={'1.25rem'} fontWeight={600}>
                        For
                    </Typography>
                    <Image
                        src={require('@/public/Spotify_Logo_RGB_Green.png')}
                        width={120}
                        height={70}
                        alt={'Home background'}
                        style={{ objectFit: 'contain' }}
                    />
                </Stack>
                <Image
                    src={require('@/public/Stagnum_Logo.png')}
                    width={500}
                    height={100}
                    alt={'Home background'}
                    style={{ objectFit: 'contain', marginTop: '-2.25rem' }}
                />

                <Typography variant="caption" fontSize={'2rem'}>
                    Simplified Collaborative Listening
                </Typography>
                <Stack
                    spacing={2}
                    direction={'row'}
                    mt={2}
                    alignItems={'center'}
                >
                    <Typography variant="h5" color={'white'}>
                        Login with your Spotify
                    </Typography>

                    <DefaultButton action={handleLoginRequest} text="Login" />
                </Stack>

                <Box display={'flex'} gap={2}>
                    <Link href="/about" color={'#ffffff'}>
                        About Stagnum
                    </Link>
                    <Link
                        href="https://github.com/EddieTheCubeHead/Stagnum/discussions"
                        color={'#42b74c'}
                        target="_blank"
                    >
                        Contact Us
                    </Link>
                </Box>
                {alert && (
                    <AlertComponent
                        alertMessage={`Login failed with error: ${errorMessage}`}
                        closeAlert={closeAlert}
                    />
                )}
            </Box>
        </Box>
    )
}

export default LoginPage
