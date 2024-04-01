import theme from "@/utils/theme";
import { TextField } from "@mui/material";
import { Dispatch, SetStateAction } from "react";

export default function PoolInput(props: { setQuery: Dispatch<SetStateAction<string>> }) {
    return (
        <TextField
            sx={{
                bgcolor: theme.palette.secondary.main,
                margin: 1,
                borderRadius: 1,
                boxShadow: 2,

            }}
            id='standard-search'
            label='Pool id'
            onChange={(e) => props.setQuery(e.target.value)}
        />
    )
}