import { Box, Card } from "@mui/material";
import Track from "@/types/trackTypes";
import Artist from "@/types/artistTypes";
import Playlist from "@/types/playlistTypes";
import { Header3 } from "@/components/textComponents";
import ShowMoreIconButton from "@/components/buttons/showMoreIconButton";
import Album from "@/types/albumTypes";

export default function PlaylistCard(props: {
    playlist: Playlist,
    handleAdd: (newAdd: Track | Album | Playlist | Artist) => void
}) {
    const { playlist, handleAdd } = props;

    const handelAdding = () => {
        handleAdd(playlist);
    };

    return (
        <Card sx={{ bgcolor: 'secondary.light' }}>
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
                    <Header3 text={playlist.name} />
                </Box>
                <ShowMoreIconButton handleAdding={handelAdding} />
            </Box>
        </Card>
    );
}
