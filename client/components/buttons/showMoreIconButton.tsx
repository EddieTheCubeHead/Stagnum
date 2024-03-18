import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import React, { useState } from 'react';

export default function ShowMoreIconButton(props: {
    handleAdding: () => void
}) {
    const { handleAdding } = props;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleOptionClick = () => {
        handleClose();
        handleAdding();
    };

    return (
        <>
            <IconButton
                aria-label=""
                onClick={handleClick}
                sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    margin: 1
                }}
            >
                <MoreHorizIcon />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                sx={{
                }}
            >
                {/* Add more options here */}
                <MenuItem onClick={handleOptionClick}>Add to Pool</MenuItem>
            </Menu>
        </>
    )
}
