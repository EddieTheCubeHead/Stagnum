import { IconButton, Tooltip } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import Album from "@/types/albumTypes";
import Artist from "@/types/artistTypes";
import Playlist from "@/types/playlistTypes";
import Track from "@/types/trackTypes";
import axios from "axios";

interface Props {
    newAdd: Track | Album | Playlist | Artist,
    handleAdding: (newAdd: Track | Album | Playlist | Artist) => void
    token: string
}

export default function AddToPoolButton({ newAdd, handleAdding, token }: Props) {

    const backend_uri = 'http://localhost:8080'

    const handleClick = () => {
        const requestData = {
            spotify_uri: newAdd.uri,
        };

        axios
            .post(`${backend_uri}/pool/content`, requestData, {
                headers: { token },
            })
            .then(function () {
                handleAdding(newAdd)
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
            >
                <AddIcon />
            </IconButton>
        </Tooltip >
    )
}