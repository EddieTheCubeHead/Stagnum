import DeleteButton from '@/components/buttons/iconButtons/deleteButton'
import { Header3 } from '@/components/textComponents'
import { Box, Card } from '@mui/material'
import { Pool, PoolCollection, PoolTrack } from '../types'

interface PoolCollectionCardProps {
    poolItem: PoolCollection | PoolTrack
    token: string
    // eslint-disable-next-line no-unused-vars
    updatePool: (pool: Pool) => void
}

const PoolCollectionCard: React.FC<PoolCollectionCardProps> = ({
    poolItem,
    token,
    updatePool,
}) => {
    const truncatedName =
        poolItem.name.length > 25
            ? poolItem.name.slice(0, 25) + '...'
            : poolItem.name

    return (
        <Card sx={{ bgcolor: 'secondary.main', width: 1, minHeight: 66 }}>
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

                    <Header3 text={truncatedName} />
                </Box>
                <Box>
                    <DeleteButton
                        poolItem={poolItem}
                        token={token}
                        updatePool={updatePool}
                    />
                </Box>
            </Box>
        </Card>
    )
}

export default PoolCollectionCard
