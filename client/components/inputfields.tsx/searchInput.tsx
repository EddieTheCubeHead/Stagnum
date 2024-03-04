import theme from "@/utils/theme";
import { TextField } from "@mui/material";
import { Dispatch, SetStateAction } from "react";

export default function SearchInput(props: { setQuery: Dispatch<SetStateAction<string>> }) {
    return (
        <TextField
            sx={{
                bgcolor: theme.palette.secondary.main,
                margin: 1,
                display: 'flex',
                borderRadius: 3,
                boxShadow: 2
            }}
            id='standard-search'
            label='Search field'
            onChange={(e) => props.setQuery(e.target.value)}
        />
    )
}