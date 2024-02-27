import React from 'react'
import { Link, ThemeProvider, Box } from '@mui/material'
import theme from '@/utils/theme';

const Footer = () => {

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{
                bgcolor: theme.palette.secondary.dark,
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
                        color: theme.palette.primary.contrastText,
                        paddingRight: 2
                    }}
                        href="/about">About Stagnum</Link>
                    <Link
                        sx={{
                            color: theme.palette.secondary.main
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
