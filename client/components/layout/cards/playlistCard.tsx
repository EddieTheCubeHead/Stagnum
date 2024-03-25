import { Box, Card } from "@mui/material";
import { Header3 } from "../../textComponents";
import DefaultButton from "../../buttons/defaulButton";
import theme from "@/utils/theme";
import Playlist from "@/types/playlistTypes";
import Track from "@/types/trackTypes";
import Album from "@/types/albumTypes";
import Artist from "@/types/artistTypes";

export default function PlaylistCard(props: {
    playlist: Playlist,
    handleAdd: (newAdd: Track | Album | Playlist | Artist) => void
    token: string
    disabled: boolean
    enableAddButton: () => void
}) {
    const { playlist, handleAdd } = props;

    const handleAdding = () => {
        handleAdd(playlist);
    };

    const truncatedName = playlist.name.length > 25 ? playlist.name.slice(0, 25) + "..." : playlist.name;

    return (
        <Card sx={{ bgcolor: 'secondary.light', width: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {playlist.icon_link && (
                        <Box
                            sx={{
                                width: 50,
                                height: 50,
                                backgroundImage: `url(${playlist.icon_link})`,
                                backgroundSize: 'cover',
                                margin: 1,
                            }}
                        />
                    )}
                    <Header3 text={truncatedName} />
                </Box>
                <Box>
                    <AddToPoolButton newAdd={playlist} handleAdding={handleAdding} token={props.token} disabled={props.disabled} />
                    <ShowMoreIconButton token={props.token} item={playlist} handleAdding={handleAdding} enableAddButton={props.enableAddButton} />
                </Box>
            </Box>
        </Card>
        </Box >
    )
}