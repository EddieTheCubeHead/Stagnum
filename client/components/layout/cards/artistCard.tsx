import { Box, Card } from "@mui/material";
import Artist from "@/types/artistTypes";
import Track from "@/types/trackTypes";
import Playlist from "@/types/playlistTypes";
import { Header3 } from "@/components/textComponents";
import ShowMoreIconButton from "@/components/buttons/showMoreIconButton";
import Album from "@/types/albumTypes";

export default function ArtistCard(props: {
    artist: Artist,
    handleAdd: (newAdd: Track | Album | Playlist | Artist) => void
}) {
    const { artist, handleAdd } = props;

    const handelAdding = () => {
        handleAdd(artist);
    };

    return (
        <Card sx={{ bgcolor: 'secondary.light' }}>
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
                    <Header3 text={artist.name} />
                </Box>
                <ShowMoreIconButton handleAdding={handelAdding} />
            </Box>
        </Card>
    );
}
