import theme from '@/components/theme'
import { TextField } from '@mui/material'
import { Dispatch, SetStateAction } from 'react'

export default function SearchInput(props: {
    setQuery: Dispatch<SetStateAction<string>>
}) {
    return (
        <TextField
            sx={{
                bgcolor: theme.palette.secondary.main,
                margin: 1,
                borderRadius: 1,
                boxShadow: 2,
                width: '80%',
            }}
            id="standard-search"
            label="Search field"
            onChange={(e) => props.setQuery(e.target.value)}
        />
    )
}
