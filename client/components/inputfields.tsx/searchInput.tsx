import { TextField } from "@mui/material"
import { Dispatch, SetStateAction } from "react"

export default function SearchInput(props: { setQuery: Dispatch<SetStateAction<string>> }) {
    return (
        <TextField
            sx={{
                bgcolor: 'secondary.main',
                margin: 1,
                borderRadius: 3,
                boxShadow: 2,
                width: 1,
            }}
            id='standard-search'
            label='Search field'
            onChange={(e) => props.setQuery(e.target.value)}
        />
    )
}