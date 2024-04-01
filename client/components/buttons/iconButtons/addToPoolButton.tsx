import { IconButton, Tooltip } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import Album from "@/types/albumTypes";
import Artist from "@/types/artistTypes";
import Playlist from "@/types/playlistTypes";
import Track from "@/types/trackTypes";
import axios from "axios";

interface Props {
    newAdd: Track | Album | Playlist | Artist,
    updatePool: (pool: Pool) => void
    token: string
    disabled: boolean
}

export default function AddToPoolButton({ newAdd, updatePool, token, disabled }: Props) {

    const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI

    const handleClick = () => {
        const requestData = {
            spotify_uri: newAdd.uri,
        };

        axios
            .post(`${backend_uri}/pool/content`, requestData, {
                headers: { token },
            })
            .then(function (response) {
                updatePool(response.data)
            })
            .catch((error) => {
                console.log("Request failed", error);
            });
    };

    return (
        <Tooltip title='Add to pool'>
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
                disabled={disabled}
            >
                <AddIcon />
            </IconButton>
        </Tooltip >
    )
}