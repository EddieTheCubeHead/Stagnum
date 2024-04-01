import { Box, Card } from '@mui/material'
import { Header3 } from '../../textComponents'
import DefaultButton from '../../buttons/defaulButton'
import theme from '@/utils/theme'
import Playlist from '@/types/playlistTypes'
import Track from '@/types/trackTypes'
import Album from '@/types/albumTypes'
import Artist from '@/types/artistTypes'
import AddToPoolButton from '@/components/buttons/iconButtons/addToPoolButton'
import ShowMoreIconButton from '@/components/buttons/iconButtons/showMoreIconButton'

export default function PlaylistCard(props: {
    playlist: Playlist
    updatePool: (pool: Pool) => void
    token: string
    disabled: boolean
    enableAddButton: () => void
}) {
    const truncatedName =
        props.playlist.name.length > 25
            ? props.playlist.name.slice(0, 25) + '...'
            : props.playlist.name

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
                    {props.playlist.icon_link && (
                        <Box
                            sx={{
                                width: 50,
                                height: 50,
                                backgroundImage: `url(${props.playlist.icon_link})`,
                                backgroundSize: 'cover',
                                margin: 1,
                            }}
                        />
                    )}
                    <Header3 text={truncatedName} />
                </Box>
                <Box>
                    <AddToPoolButton
                        newAdd={props.playlist}
                        updatePool={props.updatePool}
                        token={props.token}
                        disabled={props.disabled}
                    />
                    <ShowMoreIconButton
                        token={props.token}
                        item={props.playlist}
                        updatePool={props.updatePool}
                        enableAddButton={props.enableAddButton}
                    />
                </Box>
            </Box>
        </Card>
    )
}
