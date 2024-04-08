import { Box, Card } from '@mui/material'
import { Header3 } from '../../textComponents'
import ShowMoreIconButton from '@/components/buttons/iconButtons/showMoreIconButton'
import AddToPoolButton from '@/components/buttons/iconButtons/addToPoolButton'
import { Pool, Track } from '@/components/types'

interface TrackCardProps {
    track: Track
    // eslint-disable-next-line no-unused-vars
    updatePool: (pool: Pool) => void
    token: string
    disabled: boolean
    enableAddButton: () => void
    // eslint-disable-next-line no-unused-vars
    setErrorAlert: (message: string) => void
}

const TrackCard: React.FC<TrackCardProps> = ({
    track,
    updatePool,
    token,
    disabled,
    enableAddButton,
    setErrorAlert,
}) => {
    const truncatedName =
        track.name.length > 25 ? track.name.slice(0, 25) + '...' : track.name

    return (
        <Card sx={{ bgcolor: 'secondary.main', width: 1 }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {track.album.link && (
                        <Box
                            sx={{
                                width: 50,
                                height: 50,
                                backgroundImage: `url(${track.album.icon_link})`,
                                backgroundSize: 'cover',
                                margin: 1,
                            }}
                        />
                    )}
                    <Header3 text={truncatedName} sx={{ margin: 1 }} />
                </Box>
                <Box>
                    <AddToPoolButton
                        updatePool={updatePool}
                        newAdd={track}
                        token={token}
                        disabled={disabled}
                        setErrorAlert={setErrorAlert}
                    />
                    <ShowMoreIconButton
                        token={token}
                        item={track}
                        updatePool={updatePool}
                        enableAddButton={enableAddButton}
                        setErrorAlert={setErrorAlert}
                    />
                </Box>
            </Box>
        </Card>
    )
}

export default TrackCard
