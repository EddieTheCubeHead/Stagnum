
import { Box, Stack } from "@mui/material";
import PoolCard from "./cards/poolCollectionCard";
import PoolTrackCard from "./cards/poolCollectionCard";
import PoolCollectionCard from "./cards/poolCollectionCard";

export default function ManagePool(props: {
    pool: Pool
    token: string
    updatePool: (pool: Pool) => void
    expanded: boolean
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
                {props.pool?.users?.[0]?.tracks?.map((poolItem: any, key: number) => (
                    <PoolTrackCard poolItem={poolItem} key={key} token={props.token} updatePool={props.updatePool} />
                ))}
                {props.pool?.users?.[0]?.collections?.map((poolItem: any, key: number) => (
                    <Stack spacing={2} key={key}>
                        <PoolCard poolItem={poolItem} token={props.token} updatePool={props.updatePool} />
                        {poolItem.tracks.map((poolCollectionItem: any, innerKey: number) => (
                            <PoolCollectionCard poolItem={poolCollectionItem} token={props.token} updatePool={props.updatePool} key={innerKey} />
                        ))}
                    </Stack>
                ))}


            </Stack>
        </Box>
    )
}