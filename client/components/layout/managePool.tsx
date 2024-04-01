import Album from "@/types/albumTypes";
import Artist from "@/types/artistTypes";
import Playlist from "@/types/playlistTypes";
import Track from "@/types/trackTypes";
import { Box, Container, Stack, Typography } from "@mui/material";
import TrackCard from "./cards/trackCard";
import PoolCard from "./cards/poolCard";
import { useEffect } from "react";

export default function ManagePool(props: {
    pool: Pool
    token: string
    updatePool: (pool: Pool) => void
}) {

    return (
        <Box sx={{
            bgcolor: 'secondary.dark',
            display: 'flex',
            overflow: 'auto',
            borderRadius: '12px',
            boxShadow: 2,
        }}>
            <Stack spacing={2} sx={{
                width: 1,
                margin: 1,
            }}>
                {props.pool?.users?.[0]?.tracks?.map((poolItem: any, key) => (
                    <PoolCard poolItem={poolItem} key={key} token={props.token} updatePool={props.updatePool} />
                ))}
                {props.pool?.users?.[0]?.collections?.map((poolItem: any, key) => (
                    <PoolCard poolItem={poolItem} key={key} token={props.token} updatePool={props.updatePool} />
                ))}

            </Stack>
        </Box>
    )
}