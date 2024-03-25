import { Box, Card } from "@mui/material";
import { Header3 } from "../../textComponents";
import DefaultButton from "../../buttons/defaulButton";
import Track from "@/types/trackTypes";
import Album from "@/types/albumTypes";
import Playlist from "@/types/playlistTypes";
import Artist from "@/types/artistTypes";

export default function TrackCard(props: {
    track: Track,
    handleAdd: (newAdd: Track | Album | Playlist | Artist) => void
    token: string
    disabled: boolean
    enableAddButton: () => void
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
                    <AddToPoolButton handleAdding={handleAdding} newAdd={track} token={props.token} disabled={props.disabled} />
                    <ShowMoreIconButton token={props.token} item={track} handleAdding={handleAdding} enableAddButton={props.enableAddButton} />
                </Box>
            </Box>
        </Card>
    )
}