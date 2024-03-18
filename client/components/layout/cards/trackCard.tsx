import { Box, Card, IconButton } from "@mui/material";
import Track from "@/types/trackTypes";
import Artist from "@/types/artistTypes";
import Playlist from "@/types/playlistTypes";
import { Header3 } from "@/components/textComponents";
import ShowMoreIconButton from "@/components/buttons/showMoreIconButton";
import Album from "@/types/albumTypes";

export default function TrackCard(props: {
    track: Track,
    handleAdd: (newAdd: Track | Album | Playlist | Artist) => void
}) {
    const { track, handleAdd } = props;

    const handelAdding = () => {
        handleAdd(track);
    };

    return (
        <Card sx={{ bgcolor: 'secondary.light' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {// Track icons are not yet implemented on the backend side
                    /*track.icon_link && (
                        <Box
                            sx={{
                                width: 50,
                                height: 50,
                                backgroundImage: `url(${track.icon_link})`,
                                backgroundSize: 'cover',
                                margin: 1,
                            }}
                        />
                        )*/}
                    <Header3 text={track.name} sx={{ margin: 1 }} />
                </Box>
                <ShowMoreIconButton handleAdding={handelAdding} />
            </Box>
        </Card>
    );
}
