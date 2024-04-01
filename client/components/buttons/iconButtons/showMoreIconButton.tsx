import { IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import React, { useState } from 'react';
import axios from "axios";
import Album from "@/types/albumTypes";
import Artist from "@/types/artistTypes";
import Playlist from "@/types/playlistTypes";
import Track from "@/types/trackTypes";

interface Props {
    token: string
    item: Track | Album | Playlist | Artist
    updatePool: (pool: Pool) => void
    enableAddButton: () => void
}

export default function ShowMoreIconButton({
    token,
    item,
    updatePool,
    enableAddButton
}: Props) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const createPool = () => {
        const requestData = {
            spotify_uris: [
                {
                    spotify_uri: item.uri,
                },
            ],
        }

        const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI

        axios
            .post(`${backend_uri}/pool`, requestData, {
                headers: { token },
            })
            .then(function (response) {
                updatePool(response.data)
                enableAddButton()
            })
            .catch((error) => {
                console.log("Request failed", error);
            });
    };

    return (
        <>
            <Tooltip title='Show more'>
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
                    <MoreHorizIcon />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                sx={{
                }}
            >
                <MenuItem onClick={createPool}>Create pool</MenuItem>
            </Menu>
        </>
    )
}
