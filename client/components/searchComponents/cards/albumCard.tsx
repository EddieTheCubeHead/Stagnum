import { Box, Card } from '@mui/material'
import { Header3 } from '../../textComponents'
import AddToPoolButton from '@/components/buttons/iconButtons/addToPoolButton'
import ShowMoreIconButton from '@/components/buttons/iconButtons/showMoreIconButton'
import { Album, Pool } from '@/components/types'

interface AlbumCardProps {
    album: Album
    updatePool: (pool: Pool) => void
    token: string
    disabled: boolean
    enableAddButton: () => void
}

const AlbumCard: React.FC<AlbumCardProps> = ({
    album,
    updatePool,
    token,
    disabled,
    enableAddButton,
}) => {
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
                    {album.icon_link && (
                        <Box
                            sx={{
                                width: 50,
                                height: 50,
                                backgroundImage: `url(${album.icon_link})`,
                                backgroundSize: 'cover',
                                margin: 1,
                            }}
                        />
                    )}
                    <Header3 text={album.name} />
                </Box>
                <Box>
                    <AddToPoolButton
                        newAdd={album}
                        updatePool={updatePool}
                        token={token}
                        disabled={disabled}
                    />
                    <ShowMoreIconButton
                        token={token}
                        item={album}
                        updatePool={updatePool}
                        enableAddButton={enableAddButton}
                    />
                </Box>
            </Box>
        </Card>
    )
}

export default AlbumCard