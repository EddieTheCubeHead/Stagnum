import { Tooltip, IconButton } from '@mui/material'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import axios from 'axios'
import { Pool, PoolCollection, PoolTrack } from '@/components/types'

interface Props {
    poolItem: PoolCollection | PoolTrack
    token: string
    updatePool: (pool: Pool) => void
}

export default function DeleteButton({ poolItem, token, updatePool }: Props) {
    const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI

    const handleClick = () => {
        if ((poolItem as PoolCollection).spotify_collection_uri) {
            axios
                .delete(
                    `${backend_uri}/pool/content/${(poolItem as PoolCollection).spotify_collection_uri}`,
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
        } else {
            axios
                .delete(
                    `${backend_uri}/pool/content/${(poolItem as PoolTrack).spotify_track_uri}`,
                    {
                        headers: { token },
                    },
                )
                .then((response) => {
                    updatePool(response.data)
                })
                .catch((error) => {
                    // TODO Error alert
                })
        }
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
