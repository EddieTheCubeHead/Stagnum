import { Box, Card } from '@mui/material'
import { Header3 } from '../../textComponents'
import AddToPoolButton from '@/components/buttons/iconButtons/addToPoolButton'
import ShowMoreIconButton from '@/components/buttons/iconButtons/showMoreIconButton'
import { Artist, Pool } from '@/components/types'

interface ArtistCordProps {
    artist: Artist
    // eslint-disable-next-line no-unused-vars
    updatePool: (pool: Pool) => void
    disabled: boolean
    enableAddButton: () => void
    // eslint-disable-next-line no-unused-vars
    setErrorAlert: (message: string, type: 'error' | 'success') => void
}

const ArtistCard: React.FC<ArtistCordProps> = ({
    artist,
    updatePool,
    disabled,
    enableAddButton,
    setErrorAlert,
}) => {
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
                    {artist.icon_link && (
                        <Box
                            sx={{
                                width: 50,
                                height: 50,
                                backgroundImage: `url(${artist.icon_link})`,
                                backgroundSize: 'cover',
                                margin: 1,
                            }}
                        />
                    )}
                    <Header3 text={artist.name} color={'secondary.light'} />
                </Box>
                <Box>
                    <AddToPoolButton
                        newAdd={artist}
                        updatePool={updatePool}
                        disabled={disabled}
                        setErrorAlert={setErrorAlert}
                    />
                    <ShowMoreIconButton
                        item={artist}
                        updatePool={updatePool}
                        enableAddButton={enableAddButton}
                        setErrorAlert={setErrorAlert}
                    />
                </Box>
            </Box>
        </Card>
    )
}

export default ArtistCard
