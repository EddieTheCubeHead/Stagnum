
import { Box, Stack } from "@mui/material";
import PoolCard from "./cards/poolCollectionCard";
import PoolTrackCard from "./cards/poolCollectionCard";
import PoolCollectionCard from "./cards/poolCollectionCard";
import { useState } from "react";
import axios from "axios";
import DefaultButton from "../buttons/defaulButton";
import { Header1 } from "../textComponents";

export default function ManagePool(props: {
    pool: Pool
    token: string
    updatePool: (pool: Pool) => void
    expanded: boolean
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
                {props.pool?.users?.[0]?.tracks?.map((poolItem: any, key: number) => (
                    <PoolTrackCard poolItem={poolItem} key={key} token={props.token} updatePool={props.updatePool} />
                ))}
                {props.pool?.users?.[0]?.collections?.map((poolItem: any, key: number) => (
                    <Stack spacing={2} key={key}>
                        <PoolCollectionCard poolItem={poolItem} token={props.token} updatePool={props.updatePool} />
                        {poolItem.tracks.map((poolCollectionItem: any, innerKey: number) => (
                            /* aling this box to the right*/
                            <Box sx={{ display: 'flex', justifyContent: 'right' }} key={innerKey} >
                                <Box sx={{ width: '95%' }}>
                                    <PoolTrackCard poolItem={poolCollectionItem} token={props.token} updatePool={props.updatePool} />
                                </Box>
                            </Box>
                        ))}
                    </Stack>
                ))}
            </Stack>
        </Box>
    )
}