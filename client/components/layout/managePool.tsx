import Album from "@/types/albumTypes";
import Artist from "@/types/artistTypes";
import Playlist from "@/types/playlistTypes";
import Track from "@/types/trackTypes";
import { Box, Stack, Typography } from "@mui/material";
import TrackCard from "./cards/trackCard";
import PoolCard from "./cards/poolCard";
import { useEffect } from "react";

export default function ManagePool(props: {
    pool: Array<Album | Track | Artist | Playlist>
    token: string
    handleDelete: (itemToDelete: Album | Track | Artist | Playlist) => void
}) {

    useEffect(() => {
        console.log(props.pool)
    }, [props.pool])

    return (
        <Box sx={{
            bgcolor: 'secondary.dark',
            display: 'flex',
            width: 1
        }}>
            <Stack spacing={2} sx={{
                width: 1,
                margin: 1,

            }}>
                {props.pool.map((poolItem, key) => (
                    <PoolCard poolItem={poolItem} key={key} token={props.token} handleDelete={props.handleDelete} />
                ))}
            </Stack>
        </Box>
    )
}