import { Box, Card } from '@mui/material'
import { Header3 } from '../../textComponents'
import AddToPoolButton from '@/components/buttons/iconButtons/addToPoolButton'
import ShowMoreIconButton from '@/components/buttons/iconButtons/showMoreIconButton'
import { Artist, Pool } from '@/components/types'

interface ArtistCordProps {
    artist: Artist
    updatePool: (pool: Pool) => void
    token: string
    disabled: boolean
    enableAddButton: () => void
}

const ArtistCard: React.FC<ArtistCordProps> = ({ artist, updatePool, token, disabled, enableAddButton }) => {
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
                    <Header3 text={artist.name} />
                </Box>
                <Box>
                    <AddToPoolButton
                        newAdd={artist}
                        updatePool={updatePool}
                        token={token}
                        disabled={disabled}
                    />
                    <ShowMoreIconButton
                        token={token}
                        item={artist}
                        updatePool={updatePool}
                        enableAddButton={enableAddButton}
                    />
                </Box>
            </Box>
        </Card>
    )
}

export default ArtistCard