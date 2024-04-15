import type { Metadata } from 'next'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import React from 'react'

export const metadata: Metadata = {
    title: 'Stagnum',
    description: 'A pool-based playback handler for Spotify',
}

interface RootLayoutProps {
    children: React.ReactNode
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
    return (
        <html lang="en">
            <body style={{ margin: 0, padding: 0 }}>
                <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
            </body>
        </html>
    )
}

export default RootLayout
