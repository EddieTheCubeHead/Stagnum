import { Box, Card } from '@mui/material'
import { Header3 } from '../../textComponents'
import AddToPoolButton from '@/components/buttons/iconButtons/addToPoolButton'
import ShowMoreIconButton from '@/components/buttons/iconButtons/showMoreIconButton'
import { Album, Pool } from '@/components/types'

interface AlbumCardProps {
    album: Album
    // eslint-disable-next-line no-unused-vars
    updatePool: (pool: Pool) => void
    token: string
    disabled: boolean
    enableAddButton: () => void
    // eslint-disable-next-line no-unused-vars
    setErrorAlert: (message: string) => void
}

const AlbumCard: React.FC<AlbumCardProps> = ({
    album,
    updatePool,
    token,
    disabled,
    enableAddButton,
    setErrorAlert,
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
                        setErrorAlert={setErrorAlert}
                    />
                    <ShowMoreIconButton
                        token={token}
                        item={album}
                        updatePool={updatePool}
                        enableAddButton={enableAddButton}
                        setErrorAlert={setErrorAlert}
                    />
                </Box>
            </Box>
        </Card>
    )
}

export default AlbumCard
