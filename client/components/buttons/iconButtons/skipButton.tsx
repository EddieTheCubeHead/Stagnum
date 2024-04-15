import { IconButton } from '@mui/material'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import axios from 'axios'

interface SkipButtonProps {
    disabled?: boolean
    // eslint-disable-next-line no-unused-vars
    setErrorAlert: (message: string) => void
}

const SkipButton: React.FC<SkipButtonProps> = ({ disabled, setErrorAlert }) => {
    const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI
    const skip = (): void => {
        const headers = {
            Authorization: localStorage.getItem('token'),
        }
        axios
            .post(
                `${backend_uri}/pool/playback/skip`,
                {},
                {
                    headers: headers,
                },
            )
            .then((response) => {
                localStorage.setItem(
                    'token',
                    response.config.headers.Authorization as string,
                )
                //TODO something?
            })
            .catch((error) => {
                setErrorAlert(
                    `Skipping a song failed with error: ${error.response.data.detail}`,
                )
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
