import { Box, Card } from "@mui/material";
import { Header3 } from "../../textComponents";
import DefaultButton from "../../buttons/defaulButton";
import theme from "@/utils/theme";
import Artist from "@/types/artistTypes";
import Track from "@/types/trackTypes";
import Album from "@/types/albumTypes";
import Playlist from "@/types/playlistTypes";

export default function ArtistCard(props: {
    artist: Artist,
    handleAdd: (newAdd: Track | Album | Playlist | Artist) => void
    token: string
    disabled: boolean
    enableAddButton: () => void
}) {
    const { artist, handleAdd } = props;

    const handelAdding = () => {
        props.handleAdd(props.artist)
    }

    return (
        <Card sx={{ bgcolor: 'secondary.light', width: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                    <Header3 text={truncatedName} />
                </Box>
                <Box>
                    <AddToPoolButton newAdd={artist} handleAdding={handleAdding} token={props.token} disabled={props.disabled} />
                    <ShowMoreIconButton token={props.token} item={artist} handleAdding={handleAdding} enableAddButton={props.enableAddButton} />
                </Box>
            </Box>
        </Card>
    )
}