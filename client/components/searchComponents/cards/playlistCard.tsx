import { Box, Card } from '@mui/material'
import { Header3 } from '../../textComponents'
import AddToPoolButton from '@/components/buttons/iconButtons/addToPoolButton'
import ShowMoreIconButton from '@/components/buttons/iconButtons/showMoreIconButton'
import { Playlist, Pool } from '@/components/types'

interface PlaylistCardProps {
    playlist: Playlist
    updatePool: (pool: Pool) => void
    token: string
    disabled: boolean
    enableAddButton: () => void
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({
    playlist,
    updatePool,
    token,
    disabled,
    enableAddButton,
}) => {
    const truncatedName =
        playlist.name.length > 25
            ? playlist.name.slice(0, 25) + '...'
            : playlist.name

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
                    {playlist.icon_link && (
                        <Box
                            sx={{
                                width: 50,
                                height: 50,
                                backgroundImage: `url(${playlist.icon_link})`,
                                backgroundSize: 'cover',
                                margin: 1,
                            }}
                        />
                    )}
                    <Header3 text={truncatedName} />
                </Box>
                <Box>
                    <AddToPoolButton
                        newAdd={playlist}
                        updatePool={updatePool}
                        token={token}
                        disabled={disabled}
                    />
                    <ShowMoreIconButton
                        token={token}
                        item={playlist}
                        updatePool={updatePool}
                        enableAddButton={enableAddButton}
                    />
                </Box>
            </Box>
        </Card>
    )
}

export default PlaylistCard
