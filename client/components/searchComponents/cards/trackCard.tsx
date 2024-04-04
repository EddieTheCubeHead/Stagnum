import { Box, Card } from '@mui/material'
import { Header3 } from '../../textComponents'
import ShowMoreIconButton from '@/components/buttons/iconButtons/showMoreIconButton'
import AddToPoolButton from '@/components/buttons/iconButtons/addToPoolButton'
import { Pool, Track } from '@/components/types'

export default function TrackCard(props: {
    track: Track
    updatePool: (pool: Pool) => void
    token: string
    disabled: boolean
    enableAddButton: () => void
}) {
    const truncatedName =
        props.track.name.length > 25
            ? props.track.name.slice(0, 25) + '...'
            : props.track.name

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
                    {props.track.album.link && (
                        <Box
                            sx={{
                                width: 50,
                                height: 50,
                                backgroundImage: `url(${props.track.album.icon_link})`,
                                backgroundSize: 'cover',
                                margin: 1,
                            }}
                        />
                    )}
                    <Header3 text={truncatedName} sx={{ margin: 1 }} />
                </Box>
                <Box>
                    <AddToPoolButton
                        updatePool={props.updatePool}
                        newAdd={props.track}
                        token={props.token}
                        disabled={props.disabled}
                    />
                    <ShowMoreIconButton
                        token={props.token}
                        item={props.track}
                        updatePool={props.updatePool}
                        enableAddButton={props.enableAddButton}
                    />
                </Box>
            </Box>
        </Card>
    )
}
