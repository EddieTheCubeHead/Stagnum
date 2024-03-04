import { Box, Card } from "@mui/material";
import { Header3 } from "../../textComponents";
import DefaultButton from "../../buttons/defaulButton";
import Album from "@/types/albumTypes";

export default function AlbumCard(props: { album: Album }) {
    const imageUrl = props.album.icon_link;

    return (
        <Card>
            {/* Displaying image using img tag */}
            <Box sx={{
                position: 'relative',
                width: '100%',
                paddingTop: '100%', // Maintain aspect ratio (1:1 square)
                overflow: 'hidden',
            }}>
                <img src={imageUrl} alt="Album" style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
            <Header3 text={props.album.name} />
            <Box sx={{ marginLeft: 'auto', marginRight: 1, marginBottom: 1 }}>
                <DefaultButton text={"Add to pool"} action={() => { }} />
            </Box>
        </Card>
    );
}
