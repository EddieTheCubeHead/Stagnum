import { IconButton, Tooltip } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import axios from 'axios'
import { Album, Artist, Playlist, Pool, Track } from '@/components/types'

interface AddToPoolButtonProps {
    newAdd: Track | Album | Playlist | Artist
    // eslint-disable-next-line no-unused-vars
    updatePool: (pool: Pool) => void
    token: string
    disabled: boolean
    // eslint-disable-next-line no-unused-vars
    setErrorAlert: (message: string) => void
}

const AddToPoolButton: React.FC<AddToPoolButtonProps> = ({
    newAdd,
    updatePool,
    token,
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
                headers: { Authorization: token },
            })
            .then((response) => {
                updatePool(response.data)
            })
            .catch((error) => {
                setErrorAlert(
                    `Adding to pool failed with error: ${error.message}`,
                )
            })
    }

    return (
        <Tooltip title="Add to pool">
            <IconButton
                aria-label=""
                onClick={handleClick}
                sx={{
                    '&:hover': {
                        color: 'white',
                    },
                    color: 'black',
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
