import { Tooltip, IconButton } from '@mui/material'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import axios from 'axios'
import { Pool, PoolCollection, PoolTrack } from '@/components/types'

interface DeleteButtonProps {
    poolItem: PoolCollection | PoolTrack
    // eslint-disable-next-line no-unused-vars
    updatePool: (pool: Pool) => void
    // eslint-disable-next-line no-unused-vars
    setErrorAlert: (message: string, type: 'error' | 'success') => void
}

const DeleteButton: React.FC<DeleteButtonProps> = ({
    poolItem,
    updatePool,
    setErrorAlert,
}) => {
    const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI

    const handleClick = (): void => {
        let isCollection: boolean
        if ('spotify_resource_uri' in poolItem) {
            isCollection = true
        } else {
            isCollection = false
        }

        axios
            .delete(
                isCollection
                    ? `${backend_uri}/pool/content/${(poolItem as PoolCollection).spotify_resource_uri}`
                    : `${backend_uri}/pool/content/${(poolItem as PoolTrack).spotify_resource_uri}`,
                {
                    headers: {
                        Authorization: localStorage.getItem('token')
                            ? localStorage.getItem('token')
                            : '',
                    },
                },
            )
            .then((response) => {
                localStorage.setItem(
                    'token',
                    response.config.headers.Authorization as string,
                )
                updatePool(response.data)
            })
            .catch((error) => {
                setErrorAlert(
                    `Deleting from pool failed with error: ${error.response.data.detail}`,
                    'error',
                )
            })
    }

    return (
        <Tooltip title="Delete from pool" arrow>
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
            >
                <DeleteForeverIcon />
            </IconButton>
        </Tooltip>
    )
}

export default DeleteButton
