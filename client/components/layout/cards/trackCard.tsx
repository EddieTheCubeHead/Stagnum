import { Box, Card, IconButton } from "@mui/material";
import Track from "@/types/trackTypes";
import Artist from "@/types/artistTypes";
import Playlist from "@/types/playlistTypes";
import { Header3 } from "@/components/textComponents";
import ShowMoreIconButton from "@/components/buttons/iconButtons/showMoreIconButton";
import Album from "@/types/albumTypes";
import AddToPoolButton from "@/components/buttons/iconButtons/addToPoolButton";

export default function TrackCard(props: {
    track: Track,
    handleAdd: (newAdd: Track | Album | Playlist | Artist) => void
    token: string
}) {
    const { track, handleAdd } = props;

    const handleAdding = () => {
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
                    <Header3 text={truncatedName} sx={{ margin: 1 }} />
                </Box>
                <Box>
                    <AddToPoolButton handleAdding={handleAdding} newAdd={track} token={props.token} />
                    <ShowMoreIconButton token={props.token} item={track} handleAdding={handleAdding} />
                </Box>
            </Box>
        </Card>
    );
}
