import { Box, Card } from "@mui/material";
import { Header3 } from "../../textComponents";
import DefaultButton from "../../buttons/defaulButton";
import Track from "@/types/trackTypes";
import Album from "@/types/albumTypes";
import Playlist from "@/types/playlistTypes";
import Artist from "@/types/artistTypes";

export default function TrackCard(props: { track: Track, handleAdd: (newAdd: Track | Album | Playlist | Artist) => void  }) {
    const handelAdding = () => {
        props.handleAdd(props.track)
    }
    return (
        <Card
            sx={{
                backgroundColor: "secondary.main",
                maxHeight: 300,
                maxWidth: 300,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}>
            <Header3 text={props.track.name} />
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