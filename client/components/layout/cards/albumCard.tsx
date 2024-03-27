import { Box, Card } from '@mui/material'
import { Header3 } from '../../textComponents'
import DefaultButton from '../../buttons/defaulButton'
import Album from '@/types/albumTypes'

export default function AlbumCard(props: {
    album: Album
    handleAdd: (newAdd: Album) => void
}) {
    const addAlbum = () => {
        props.handleAdd(props.album)
    }

    return (
        <Card
            sx={{
                backgroundColor: 'secondary.main',
                maxHeight: 300,
                maxWidth: 300,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            <Header3 text={props.album.name} />
            <Box
                sx={{
                    marginLeft: 'auto',
                    marginRight: 1,
                    marginBottom: 1,
                }}
            >
                <DefaultButton text={'Add to pool'} action={addAlbum} />
            </Box>
        </Card>
    )
}
