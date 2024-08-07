'use client'

import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Box, Grid, Link, Stack, Typography } from '@mui/material'
// import DefaultButton from "@/components/buttons/defaulButton";
import Image from 'next/image'
import React from 'react'
import DefaultButton from '@/components/buttons/defaulButton'
import { useState } from 'react'
import AlertComponent from '@/components/alertComponent'

const LoginPage: React.FC = () => {
    const [alert, setAlert] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [alertType, setAlertType] = useState<'error' | 'success'>('error')
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
                    'error',
                )
            })
    }

    const setErrorAlert = (
        message: string,
        type: 'error' | 'success',
    ): void => {
        setErrorMessage(message)
        setAlert(true)
        setAlertType(type)
    }

    const closeAlert = (): void => {
        setAlert(false)
    }

    return (
        <Grid
            container
            spacing={2}
            bgcolor={'black'}
            sx={{ minHeight: '100vh', width: '100%', margin: 0, padding: 0 }}
            // justifyContent={"center"}
            alignItems={'center'}
        >
            <Grid
                item
                xs={12}
                sm={6}
                justifyContent={'center'}
                alignItems={'center'}
                display={'flex'}
                flexDirection={'column'}
                gap={2}
                zIndex={1}
            >
                <Stack
                    spacing={1}
                    direction={'row'}
                    alignItems={'end'}
                    ml={{ xs: 13, sm: 25, lg: 42 }}
                    mb={-3}
                >
                    <Typography
                        fontSize={'1.25rem'}
                        fontWeight={600}
                        color={'white'}
                    >
                        For
                    </Typography>
                    <Image
                        src={require('@/public/Spotify_Logo_RGB_Green.png')}
                        width={120}
                        height={40}
                        alt={'Home background'}
                        style={{ objectFit: 'contain' }}
                    />
                </Stack>
                <Stack
                    width={{ xs: 280, sm: 400, lg: 500 }}
                    height={{ xs: 50, sm: 70, lg: 100 }}
                    // flex={1}
                    display={'flex'}
                    position={'relative'}
                >
                    <Image
                        src={require('@/public/Stagnum_Logo.png')}
                        alt={'Home background'}
                        fill
                        style={{
                            objectFit: 'contain',
                            flex: 1,
                        }}
                    />
                </Stack>
                <Typography
                    variant="caption"
                    fontSize={{ lg: '2rem', sm: '1.8rem', xs: '1.5rem' }}
                    color={'white'}
                    textAlign={'center'}
                >
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
                        type={alertType}
                    />
                )}
            </Grid>

            <Grid
                justifyContent={'center'}
                alignItems={'center'}
                display={{ xs: 'none', sm: 'flex' }}
                sx={{
                    height: '100vh',
                }}
            >
                <Image
                    src={require('@/public/homeBG.jpg')}
                    fill
                    alt={'Home background'}
                />
            </Grid>
        </Grid>
    )
}

export default LoginPage
