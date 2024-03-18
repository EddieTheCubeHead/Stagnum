import { Box, Card } from "@mui/material";
import Album from "@/types/albumTypes";
import Track from "@/types/trackTypes";
import Artist from "@/types/artistTypes";
import Playlist from "@/types/playlistTypes";
import { Header3 } from "@/components/textComponents";
import ShowMoreIconButton from "@/components/buttons/showMoreIconButton";

export default function AlbumCard(props: {
    album: Album,
    handleAdd: (newAdd: Track | Album | Playlist | Artist) => void
}) {
    const { album, handleAdd } = props;

    const handelAdding = () => {
        handleAdd(album);
    };

    return (
        <Card sx={{ bgcolor: 'secondary.light' }}>
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
                    <Header3 text={album.name} />
                </Box>
                <ShowMoreIconButton handleAdding={handelAdding} />
            </Box>
        </Card>
    );
}
