import { Tooltip, IconButton } from "@mui/material";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import axios from "axios";
import Album from "@/types/albumTypes";
import Artist from "@/types/artistTypes";
import Playlist from "@/types/playlistTypes";
import Track from "@/types/trackTypes";

interface Props {
    poolItem: PoolCollection | PoolTrack
    token: string
    handleDelete: (itemToDelete: PoolCollection | PoolTrack) => void
}

export default function DeleteButton({
    poolItem,
    token,
    handleDelete
}: Props) {

    const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI

    const handleClick = () => {
        axios
            .delete(`${backend_uri}/pool/content/${poolItem.spotify_icon_uri}`, {
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