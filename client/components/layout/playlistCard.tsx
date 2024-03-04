import { Box, Card } from "@mui/material";
import { Header3 } from "../textComponents";
import DefaultButton from "../buttons/defaulButton";
import theme from "@/utils/theme";
import Playlist from "@/types/playlistTypes";
import Track from "@/types/trackTypes";
import Album from "@/types/albumTypes";

export default function PlaylistCard(props: { playlist: Playlist, handleAdd: (newAdd: Track | Album | Playlist) => void }) {
    const imageUrl = props.playlist.icon_link

    const handelAdding = () => {
        props.handleAdd(props.playlist)
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
            <Header3 text={props.playlist.name} />
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