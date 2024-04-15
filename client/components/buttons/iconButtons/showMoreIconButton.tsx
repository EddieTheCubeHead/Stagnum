import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import React, { useState } from 'react'
import axios from 'axios'
import { Album, Artist, Playlist, Pool, Track } from '@/components/types'

interface ShowMoreIconButtonProps {
    item: Track | Album | Playlist | Artist
    // eslint-disable-next-line no-unused-vars
    updatePool: (pool: Pool) => void
    enableAddButton: () => void
    // eslint-disable-next-line no-unused-vars
    setErrorAlert: (message: string) => void
}

const ShowMoreIconButton: React.FC<ShowMoreIconButtonProps> = ({
    item,
    updatePool,
    enableAddButton,
    setErrorAlert,
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
                headers: { Authorization: localStorage.getItem('token') },
            })
            .then((response) => {
                updatePool(response.data)
                enableAddButton()
            })
            .catch((error) => {
                setErrorAlert(
                    `Creating a pool failed with error: ${error.response.data.detail}`,
                )
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
                            color: 'primary.main',
                        },
                        color: 'secondary.light',
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
