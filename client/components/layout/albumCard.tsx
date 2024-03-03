import { Box, Card } from "@mui/material";
import { Header3 } from "../textComponents";
import DefaultButton from "../buttons/defaulButton";
import Album from "@/types/albumTypes";

export default function AlbumCard(props: { album: Album }) {
    const imageUrl = props.album.icon_link

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
                <DefaultButton text={"Add to pool"} action={() => { }} />
            </Box>
        </Card>
    )
}