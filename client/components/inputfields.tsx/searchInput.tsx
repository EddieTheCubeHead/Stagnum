import theme from "@/utils/theme";
import { TextField } from "@mui/material";
import { Dispatch, SetStateAction } from "react";

export default function SearchInput(props: { setQuery: Dispatch<SetStateAction<string>> }) {
    return (
        <TextField
            sx={{
                bgcolor: theme.palette.secondary.main,
                margin: 1,
                width: 500,
                borderRadius: 3,
                boxShadow: 2
            }}
            id='standard-search'
            label='Search field'
            type='search'
            variant="standard"
            onChange={(e) => props.setQuery(e.target.value)}
        />
    )
}