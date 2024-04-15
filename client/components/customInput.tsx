import styled from '@emotion/styled'
import { TextField } from '@mui/material'

const CustomInput = styled(TextField)({
    '& label.Mui-focused': {
        color: '#1976D2',
    },
    '& .MuiInput-underline:after': {
        borderBottomColor: '#D5D5D5',
    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: '#D5D5D5',
        },
        '&:hover fieldset': {
            borderColor: '#959595',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#1976D2',
        },
    },
})

export default CustomInput
