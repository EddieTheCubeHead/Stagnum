import { Box, Card } from '@mui/material'
import { Header3 } from '../../textComponents'
import ShowMoreIconButton from '@/components/buttons/iconButtons/showMoreIconButton'
import AddToPoolButton from '@/components/buttons/iconButtons/addToPoolButton'
import { Pool, Track } from '@/components/types'

interface TrackCardProps {
    track: Track
    // eslint-disable-next-line no-unused-vars
    updatePool: (pool: Pool) => void
    disabled: boolean
    enableAddButton: () => void
    // eslint-disable-next-line no-unused-vars
    setErrorAlert: (message: string, type: 'error' | 'success') => void
}

const TrackCard: React.FC<TrackCardProps> = ({
    track,
    updatePool,
    disabled,
    enableAddButton,
    setErrorAlert,
}) => {
    const truncatedName =
        track.name.length > 25 ? track.name.slice(0, 25) + '...' : track.name

    return (
        <Card
            sx={{
                bgcolor: 'secondary.main',
                width: 1,
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
                    <Header3 text={truncatedName} color={'secondary.light'} />
                </Box>
                <Box>
                    <AddToPoolButton
                        updatePool={updatePool}
                        newAdd={track}
                        disabled={disabled}
                        setErrorAlert={setErrorAlert}
                    />
                    <ShowMoreIconButton
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
