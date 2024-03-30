import AddToPoolButton from "@/components/buttons/iconButtons/addToPoolButton";
import DeleteButton from "@/components/buttons/iconButtons/deleteButton";
import ShowMoreIconButton from "@/components/buttons/iconButtons/showMoreIconButton";
import { Header3 } from "@/components/textComponents";
import Album from "@/types/albumTypes";
import Artist from "@/types/artistTypes";
import Playlist from "@/types/playlistTypes";
import Track from "@/types/trackTypes";
import { Box, Card } from "@mui/material";

export default function PoolCard(props: {
    poolItem: Track | Album | Playlist | Artist
    token: string
    handleDelete: (itemToDelete: Album | Track | Artist | Playlist) => void
}) {

    const truncatedName = props.poolItem.name.length > 25 ? props.poolItem.name.slice(0, 25) + "..." : props.poolItem.name;

    return (
        <Card sx={{ bgcolor: 'secondary.main', width: 1, minHeight: 66 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                        sx={{
                            width: 50,
                            height: 50,
                            //backgroundImage: `url(${props.poolItem.icon_link})`,
                            bgcolor: 'black',
                            backgroundSize: 'cover',
                            margin: 1,
                        }}
                    />

                    <Header3 text={truncatedName} />
                </Box>
                <Box>
                    <DeleteButton poolItem={props.poolItem} token={props.token} handleDelete={props.handleDelete} />
                </Box>
            </Box>
        </Card>
    )
}