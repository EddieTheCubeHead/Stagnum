import { Box, Card } from "@mui/material";
import Artist from "@/types/artistTypes";
import Track from "@/types/trackTypes";
import Playlist from "@/types/playlistTypes";
import { Header3 } from "@/components/textComponents";
import ShowMoreIconButton from "@/components/buttons/iconButtons/showMoreIconButton";
import Album from "@/types/albumTypes";
import AddToPoolButton from "@/components/buttons/iconButtons/addToPoolButton";

export default function ArtistCard(props: {
    artist: Artist,
    handleAdd: (newAdd: Track | Album | Playlist | Artist) => void
}) {
    const { artist, handleAdd } = props;

    const handelAdding = () => {
        handleAdd(artist);
    };

    const truncatedName = artist.name.length > 25 ? artist.name.slice(0, 25) + "..." : artist.name;

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
                    <AddToPoolButton />
                    <ShowMoreIconButton handleAdding={handelAdding} />
                </Box>
            </Box>
        </Card>
    );
}
