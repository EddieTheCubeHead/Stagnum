import Album from "@/types/albumTypes";
import Artist from "@/types/artistTypes";
import Playlist from "@/types/playlistTypes";
import Track from "@/types/trackTypes";
import { Box, Container, Stack, Typography } from "@mui/material";
import TrackCard from "./cards/trackCard";
import PoolCard from "./cards/poolCard";
import { useEffect, useState } from "react";
import DefaultButton from "../buttons/defaulButton";
import axios from "axios";
import { Header1 } from "../textComponents";

export default function ManagePool(props: {
    pool: Pool
    token: string
    updatePool: (pool: Pool) => void
}) {
    const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI
    const token = props.token;
    const [ res, setRes] = useState("")
    const handleShare = () => {
        axios
        .post(`${backend_uri}/pool/share`,{}, {
            headers: { token },
        })
        .then(function (response) {
            console.log(response)
        })
        .catch((error) => {
            console.log("Request failed", error);
        });
    }

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
                <DefaultButton text="share" action={handleShare}/>
                <Header1 text={res}/>
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