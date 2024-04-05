import theme from '@/components/theme'
import { TextField } from '@mui/material'
import { Dispatch, SetStateAction } from 'react'

interface SearchInputProps {
    setQuery: Dispatch<SetStateAction<string>>
}

const SearchInput: React.FC<SearchInputProps> = ({ setQuery }) => {
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
            onChange={(e) => setQuery(e.target.value)}
        />
    )
}

export default SearchInput