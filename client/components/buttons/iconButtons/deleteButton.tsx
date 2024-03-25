import { Tooltip, IconButton } from "@mui/material";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import axios from "axios";
import Album from "@/types/albumTypes";
import Artist from "@/types/artistTypes";
import Playlist from "@/types/playlistTypes";
import Track from "@/types/trackTypes";

interface Props {
    poolItem: Track | Album | Playlist | Artist
    token: string
    handleDelete: (itemToDelete: Album | Track | Artist | Playlist) => void
}

export default function DeleteButton({
    poolItem,
    token,
    handleDelete
}: Props) {

    const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI

    const handleClick = () => {
        axios
            .get(`${backend_uri}/pool/content/${poolItem.uri}`, {
                headers: { token },
            })
            .then(function () {
                handleDelete(poolItem)
            })
            .catch((error) => {
                console.log("Request failed", error);
            });
    };

    return (
        <Tooltip title='Delete from pool'>
            <IconButton
                aria-label=""
                onClick={handleClick}
                sx={{
                    "&:hover": {
                        color: 'white',
                    },
                    color: 'black',
                    margin: 1
                }}
            >
                <DeleteForeverIcon />
            </IconButton>
        </Tooltip >
    )
}