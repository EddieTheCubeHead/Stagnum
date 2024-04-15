import theme from '@/components/theme'
import { Dispatch, SetStateAction } from 'react'
import CustomInput from './customInput'

interface PoolInputProps {
    setQuery: Dispatch<SetStateAction<string>>
}

const PoolInput: React.FC<PoolInputProps> = ({ setQuery }) => {
    return (
        <CustomInput
            sx={{
                bgcolor: theme.palette.secondary.main,
                margin: 1,
                borderRadius: 1,
                boxShadow: '3px 3px 3px',
            }}
            id="standard-search"
            label="Pool ID"
            onChange={(e) => setQuery(e.target.value)}
        />
    )
}

export default PoolInput
