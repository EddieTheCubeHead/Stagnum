import { Tooltip, IconButton } from '@mui/material'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import axios from 'axios'
import { Pool, PoolCollection, PoolTrack } from '@/components/types'

interface DeleteButtonProps {
    poolItem: PoolCollection | PoolTrack
    token: string
    updatePool: (pool: Pool) => void
}

const DeleteButton: React.FC<DeleteButtonProps> = ({
    poolItem,
    token,
    updatePool,
}) => {
    const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI

    const handleClick = (): void => {
        let isCollection: boolean
        if ('spotify_collection_uri' in poolItem) {
            isCollection = true
        } else {
            isCollection = false
        }

        axios
            .delete(
                isCollection
                    ? `${backend_uri}/pool/content/${(poolItem as PoolCollection).spotify_collection_uri}`
                    : `${backend_uri}/pool/content/${(poolItem as PoolTrack).spotify_track_uri}`,
                {
                    headers: { token },
                },
            )
            .then((response) => {
                updatePool(response.data)
            })
            .catch(() => {
                // TODO Error alert
            })
    }

    return (
        <Tooltip title="Delete from pool">
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
            >
                <DeleteForeverIcon />
            </IconButton>
        </Tooltip>
    )
}

export default DeleteButton
