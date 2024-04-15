import theme from '@/components/theme'
import { Dispatch, SetStateAction } from 'react'
import CustomInput from '../customInput'

interface SearchInputProps {
    setQuery: Dispatch<SetStateAction<string>>
}

const SearchInput: React.FC<SearchInputProps> = ({ setQuery }) => {
    return (
        <CustomInput
            sx={{
                bgcolor: theme.palette.secondary.main,
                borderColor: theme.palette.secondary.light,
                margin: 1,
                borderRadius: 1,
                boxShadow: '3px 3px 3px',
                width: '80%',
            }}
            id="standard-search"
            label="Search field"
            onChange={(e: { target: { value: SetStateAction<string> } }) =>
                setQuery(e.target.value)
            }
        />
    )
}

export default SearchInput
