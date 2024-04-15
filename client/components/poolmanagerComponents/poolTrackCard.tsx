import DeleteButton from '@/components/buttons/iconButtons/deleteButton'
import { Header3 } from '@/components/textComponents'
import { Box, Card } from '@mui/material'
import { Pool, PoolTrack } from '../types'

interface PoolTrackCardProps {
    poolItem: PoolTrack
    // eslint-disable-next-line no-unused-vars
    updatePool: (pool: Pool) => void
    // eslint-disable-next-line no-unused-vars
    setErrorAlert: (message: string, type: 'error' | 'success') => void
}
const PoolTrackCard: React.FC<PoolTrackCardProps> = ({
    poolItem,
    updatePool,
    setErrorAlert,
}) => {
    const truncatedName =
        poolItem.name.length > 25
            ? poolItem.name.slice(0, 25) + '...'
            : poolItem.name

    return (
        <Card
            sx={{
                bgcolor: 'secondary.main',
                width: 0.6,
                minHeight: 66,
                boxShadow: '3px 3px 3px',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                        sx={{
                            width: 50,
                            height: 50,
                            backgroundImage: `url(${poolItem.spotify_icon_uri})`,
                            bgcolor: 'black',
                            backgroundSize: 'cover',
                            margin: 1,
                        }}
                    />

                    <Header3 text={truncatedName} color={'secondary.light'} />
                </Box>
                <Box>
                    <DeleteButton
                        poolItem={poolItem}
                        updatePool={updatePool}
                        setErrorAlert={setErrorAlert}
                    />
                </Box>
            </Box>
        </Card>
    )
}

export default PoolTrackCard
