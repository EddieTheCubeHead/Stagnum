import React from 'react'
import { Link, Box, Grid } from '@mui/material'
import theme from '@/components/theme'
import SkipButton from '../buttons/iconButtons/skipButton'
import { Text } from '../textComponents'
import { Pool, PoolTrack, User } from '../types'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import NegativeButton from '../buttons/negativeButton'

interface FooterProps {
    // eslint-disable-next-line no-unused-vars
    setErrorAlert: (message: string, type: 'error' | 'success') => void
    pool: Pool
    currentTrack: PoolTrack
    handleDelete: () => void
    handleLeave: () => void
    user: User
}

const Footer: React.FC<FooterProps> = ({
    setErrorAlert,
    pool,
    currentTrack,
    handleDelete,
    handleLeave,
    user,
}) => {
    const router = useRouter()

    const setTokenToNull = (): void => {
        if (pool.users[0].user.spotify_id === user.spotify_id) {
            handleDelete
        } else {
            handleLeave
        }
        localStorage.removeItem('token')
        router.push('/login')
    }

    return (
        <Box
            sx={{
                bgcolor: theme.palette.secondary.dark,
                flexGrow: 1,
                height: 60,
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
            }}
        >
            <Grid container>
                <Grid item xs={2} sx={{ padding: 1 }}>
                    <NegativeButton text={'Log out'} action={setTokenToNull} />
                </Grid>
                <Grid
                    item
                    xs={8}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    container
                    gap={2}
                >
                    {/*Image size fixed only for demo. Change when addressing first comment*/}
                    {currentTrack.spotify_icon_uri.length > 0 ? (
                        <Box
                            sx={{
                                width: 50,
                                height: 50,
                                backgroundImage: `url(${currentTrack.spotify_icon_uri})`,
                                bgcolor: 'black',
                                backgroundSize: 'cover',
                                margin: 1,
                            }}
                        />
                    ) : (
                        <Image
                            style={{
                                width: 50,
                                height: 50,
                            }}
                            src={require('@/public/logo.png')}
                            alt={'Track image'}
                        />
                    )}

                    <Text
                        text={currentTrack.name}
                        fontWeight={'bold'}
                        color={'white'}
                    />

                    <SkipButton
                        setErrorAlert={setErrorAlert}
                        disabled={pool.users.length === 0}
                    />
                </Grid>
                <Grid
                    item
                    xs={2}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    sx={{ padding: 1 }}
                    container
                >
                    <Grid item xs={6}>
                        <Link
                            sx={{
                                color: theme.palette.primary.contrastText,
                                paddingRight: 2,
                            }}
                            href="/about"
                        >
                            About Stagnum
                        </Link>
                    </Grid>
                    <Grid item xs={6}>
                        <Link
                            sx={{
                                color: theme.palette.primary.contrastText,
                            }}
                            href="https://github.com/EddieTheCubeHead/Stagnum/discussions"
                            target="_blank"
                        >
                            Contact Us
                        </Link>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    )
}

export default Footer
