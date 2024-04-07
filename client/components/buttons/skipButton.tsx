import { IconButton } from '@mui/material'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import axios from 'axios'

interface SkipButtonProps {
    disabled?: boolean
    token: string
}

const SkipButton: React.FC<SkipButtonProps> = ({ disabled, token }) => {
    const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI
    const skip = (): void => {
        const headers = {
            Authorization: token,
        }
        axios
            .post(
                `${backend_uri}/pool/playback/skip`,
                {},
                {
                    headers: headers,
                },
            )
            .then(() => {
                //TODO something?
            })
            .catch(() => {
                // TODO Error alert
            })
    }

    return (
        <IconButton aria-label="skip" onClick={skip} disabled={disabled}>
            <SkipNextIcon
                color={!disabled ? 'primary' : 'disabled'}
                fontSize="large"
            />
        </IconButton>
    )
}

export default SkipButton
