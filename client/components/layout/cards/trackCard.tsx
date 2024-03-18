import { Box, Card, IconButton } from "@mui/material";
import Track from "@/types/trackTypes";
import Artist from "@/types/artistTypes";
import Playlist from "@/types/playlistTypes";
import { Text } from "@/components/textComponents";
import ShowMoreIconButton from "@/components/buttons/showMoreIconButton";
import Album from "@/types/albumTypes";
import AddToPoolButton from "@/components/buttons/addToPoolButton";

export default function TrackCard(props: {
    track: Track,
    handleAdd: (newAdd: Track | Album | Playlist | Artist) => void
}) {
    const { track, handleAdd } = props;

    const handelAdding = () => {
        handleAdd(track);
    };

    const truncatedName = track.name.length > 25 ? track.name.slice(0, 25) + "..." : track.name;


    return (
        <Card sx={{ bgcolor: 'secondary.light', width: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {track.album.icon_link && (
                        <Box
                            sx={{
                                width: 50,
                                height: 50,
                                backgroundImage: `url(${track.album.icon_link})`,
                                backgroundSize: 'cover',
                                margin: 1,
                            }}
                        />
                    )}
                    <Text text={truncatedName} sx={{ margin: 1 }} />
                </Box>
                <Box>
                    <AddToPoolButton />
                    <ShowMoreIconButton handleAdding={handelAdding} />
                </Box>
            </Box>
        </Card>
    );
}
