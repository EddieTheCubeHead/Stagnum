import React from 'react'
import { Link, ThemeProvider, Box } from '@mui/material'
import stagnumTheme from '@/theme/stagnumTheme';

const Footer = () => {

    return (
        <ThemeProvider theme={stagnumTheme}>
            <Box sx={{
                bgcolor: stagnumTheme.palette.primary.main,
                flexGrow: 1,
                height: 60,
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0
            }}>
                <Box sx={{
                    padding: 1
                }}>
                    <Link sx={{
                        color: stagnumTheme.palette.primary.contrastText,
                        paddingRight: 2
                    }}
                        href="/about">About Stagnum</Link>
                    <Link
                        sx={{
                            color: stagnumTheme.palette.secondary.main
                        }}
                        href="https://github.com/EddieTheCubeHead/Stagnum/discussions"
                        target="_blank"
                    >
                        Contact Us
                    </Link>
                </Box>
            </Box>
        </ThemeProvider>
    )
}

export default Footer
