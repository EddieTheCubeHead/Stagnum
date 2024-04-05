import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import React, { useState } from 'react'
import axios from 'axios'
import { Album, Artist, Playlist, Pool, Track } from '@/components/types'

interface ShowMoreIconButtonProps {
    token: string
    item: Track | Album | Playlist | Artist
    updatePool: (pool: Pool) => void
    enableAddButton: () => void
}

const ShowMoreIconButton: React.FC<ShowMoreIconButtonProps> = ({
    token,
    item,
    updatePool,
    enableAddButton,
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = (): void => {
        setAnchorEl(null)
    }

    const createPool = (): void => {
        const requestData = {
            spotify_uris: [
                {
                    spotify_uri: item.uri,
                },
            ],
        }

        const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI

        axios
            .post(`${backend_uri}/pool`, requestData, {
                headers: { token },
            })
            .then(function (response) {
                updatePool(response.data)
                enableAddButton()
            })
            .catch(() => {
                // TODO Error alert
            })
    }

    return (
        <>
            <Tooltip title="Show more">
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
                    <MoreHorizIcon />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                sx={{}}
            >
                <MenuItem onClick={createPool}>Create pool</MenuItem>
            </Menu>
        </>
    )
}

export default ShowMoreIconButton
