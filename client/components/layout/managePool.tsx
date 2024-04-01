
import { Box, Stack } from "@mui/material";
import PoolCard from "./cards/poolCard";

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