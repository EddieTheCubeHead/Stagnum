import { Box, Card } from "@mui/material";
import { Header3 } from "../textComponents";
import DefaultButton from "../buttons/defaulButton";
import Album from "@/types/albumTypes";
import Track from "@/types/trackTypes";
import Artist from "@/types/artistTypes";
import Playlist from "@/types/playlistTypes";

export default function AlbumCard(props: { album: Album, handleAdd: (newAdd: Track | Album | Playlist | Artist) => void }) {
    const imageUrl = props.album.icon_link
    const handelAdding = () => {
        props.handleAdd(props.album)
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
            }}>
            <Header3 text={props.album.name} />
            <Box sx={{
                marginLeft: 'auto',
                marginRight: 1,
                marginBottom: 1
            }}>
                <DefaultButton text={"Add to pool"} action={handelAdding} />
            </Box>
        </Card>
    )
}