import theme from '@/components/theme'
import { Cancel, ExpandLess, ExpandMore, Square } from '@mui/icons-material'
import {
    Collapse,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from '@mui/material'
import React, { useState } from 'react'
import { PoolItem } from './PoolList'

const PoolListItem = (props: { item: PoolItem }) => {
    const [open, setOpen] = useState(false)
    const handleClick = () => {
        setOpen(!open)
    }

    return (
        <>
            <ListItemButton
                sx={{
                    bgcolor: theme.palette.secondary.light,
                    mb: 2,
                    ':hover': {
                        bgcolor: theme.palette.secondary.contrastText,
                        color: theme.palette.secondary.main,
                    },
                }}
                onClick={props.item.isExpandable ? handleClick : () => {}}
            >
                <ListItemIcon>
                    <Square color="primary" />
                </ListItemIcon>
                <ListItemText primary={props.item.title} />
                <Cancel color="error" />
                {props.item.isExpandable ? (
                    open ? (
                        <ExpandLess color="primary" />
                    ) : (
                        <ExpandMore color="primary" />
                    )
                ) : (
                    <></>
                )}
            </ListItemButton>
            {props.item.isExpandable && open ? (
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {props.item.children?.map((child) => {
                            return (
                                <ListItemButton
                                    key={child.id}
                                    sx={{
                                        bgcolor: theme.palette.secondary.light,
                                        mb: 2,
                                        ml: 10,
                                        ':hover': {
                                            bgcolor:
                                                theme.palette.secondary
                                                    .contrastText,
                                            color: theme.palette.secondary.main,
                                        },
                                    }}
                                >
                                    <ListItemIcon>
                                        <Square color="primary" />
                                    </ListItemIcon>
                                    <ListItemText primary={child.title} />
                                    <Cancel color="error" />
                                </ListItemButton>
                            )
                        })}
                    </List>
                </Collapse>
            ) : (
                <></>
            )}
        </>
    )
}

export default PoolListItem
