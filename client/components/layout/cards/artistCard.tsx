import { Box, Card } from '@mui/material'
import { Header3 } from '../../textComponents'
import DefaultButton from '../../buttons/defaulButton'
import theme from '@/utils/theme'
import Artist from '@/types/artistTypes'
import Track from '@/types/trackTypes'
import Album from '@/types/albumTypes'
import Playlist from '@/types/playlistTypes'

export default function ArtistCard(props: {
    artist: Artist
    handleAdd: (newAdd: Track | Album | Playlist | Artist) => void
}) {
    const imageUrl = props.artist.icon_link

    const handelAdding = () => {
        props.handleAdd(props.artist)
    }

    return (
        <Card
            sx={{
                backgroundImage: `url(${imageUrl})`,
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            <Header3 text={props.artist.name} />
            <Box
                sx={{
                    marginLeft: 'auto',
                    marginRight: 1,
                    marginBottom: 1,
                }}
            >
                <DefaultButton text={'Add to pool'} action={handelAdding} />
            </Box>
        </Card>
    )
}
