import { IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import React, { useState } from 'react';

export default function ShowMoreIconButton(props: {
}) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleOptionClick = () => {
        handleClose();
    };

    return (
        <>
            <Tooltip title='Show more'>
                <IconButton
                    aria-label=""
                    onClick={handleClick}
                    sx={{
                        "&:hover": {
                            color: 'white',
                        },
                        color: 'black',
                        margin: 1
                    }}
                >
                    <MoreHorizIcon />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                sx={{
                }}
            >
                <MenuItem onClick={handleOptionClick}>Create pool</MenuItem>
            </Menu>
        </>
    )
}
