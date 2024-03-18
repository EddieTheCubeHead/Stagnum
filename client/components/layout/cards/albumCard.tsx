import { Box, Card } from "@mui/material";
import Album from "@/types/albumTypes";
import Track from "@/types/trackTypes";
import Artist from "@/types/artistTypes";
import Playlist from "@/types/playlistTypes";
import { Text } from "@/components/textComponents";
import ShowMoreIconButton from "@/components/buttons/showMoreIconButton";
import AddToPoolButton from "@/components/buttons/addToPoolButton";

export default function AlbumCard(props: {
    album: Album,
    handleAdd: (newAdd: Track | Album | Playlist | Artist) => void
}) {
    const { album, handleAdd } = props;

    const handelAdding = () => {
        handleAdd(album);
    };

    const truncatedName = album.name.length > 25 ? album.name.slice(0, 25) + "..." : album.name;

    return (
        <Card sx={{ bgcolor: 'secondary.light', width: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {album.icon_link && (
                        <Box
                            sx={{
                                width: 50,
                                height: 50,
                                backgroundImage: `url(${album.icon_link})`,
                                backgroundSize: 'cover',
                                margin: 1,
                            }}
                        />
                    )}
                    <Text text={truncatedName} />
                </Box>
                <Box>
                    <AddToPoolButton />
                    <ShowMoreIconButton handleAdding={handelAdding} />
                </Box>
            </Box>
        </Card>
    );
}
