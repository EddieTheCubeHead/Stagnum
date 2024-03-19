import { Box, Card } from "@mui/material";
import Track from "@/types/trackTypes";
import Artist from "@/types/artistTypes";
import Playlist from "@/types/playlistTypes";
import { Header3 } from "@/components/textComponents";
import ShowMoreIconButton from "@/components/buttons/iconButtons/showMoreIconButton";
import Album from "@/types/albumTypes";
import AddToPoolButton from "@/components/buttons/iconButtons/addToPoolButton";

export default function PlaylistCard(props: {
    playlist: Playlist,
    handleAdd: (newAdd: Track | Album | Playlist | Artist) => void
    token: string
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
                    <AddToPoolButton newAdd={playlist} handleAdding={handleAdding} token={props.token} />
                    <ShowMoreIconButton />
                </Box>
            </Box>
        </Card>
    );
}
