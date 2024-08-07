import { IconButton, Tooltip } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import axios from 'axios'
import { Album, Artist, Playlist, Pool, Track } from '@/components/types'

interface AddToPoolButtonProps {
    newAdd: Track | Album | Playlist | Artist
    // eslint-disable-next-line no-unused-vars
    updatePool: (pool: Pool) => void
    disabled: boolean
    // eslint-disable-next-line no-unused-vars
    setErrorAlert: (message: string, type: 'error' | 'success') => void
}

const AddToPoolButton: React.FC<AddToPoolButtonProps> = ({
    newAdd,
    updatePool,
    disabled,
    setErrorAlert,
}) => {
    const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI

    const handleClick = (): void => {
        const requestData = {
            spotify_uri: newAdd.uri,
        }

        axios
            .post(`${backend_uri}/pool/content`, requestData, {
                headers: {
                    Authorization: localStorage.getItem('token')
                        ? localStorage.getItem('token')
                        : '',
                },
            })
            .then((response) => {
                localStorage.setItem(
                    'token',
                    response.config.headers.Authorization as string,
                )
                updatePool(response.data)
                setErrorAlert('Added item to pool successfully', 'success')
            })
            .catch((error) => {
                setErrorAlert(
                    `Adding to pool failed with error: ${error.response.data.detail}`,
                    'error',
                )
            })
    }

    return (
        <Tooltip title="Add to pool" arrow>
            <IconButton
                aria-label=""
                onClick={handleClick}
                sx={{
                    '&:hover': {
                        color: 'primary.main',
                        transform: 'scale(1.2)',
                    },
                    color: 'secondary.light',
                    margin: 1,
                }}
                disabled={disabled}
            >
                <AddIcon />
            </IconButton>
        </Tooltip>
    )
}

export default AddToPoolButton
