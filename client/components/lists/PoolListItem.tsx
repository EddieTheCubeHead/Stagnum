import theme from "@/utils/theme";
import { Cancel, ExpandLess, ExpandMore, Square } from "@mui/icons-material";
import {
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import React, { useState } from "react";

const PoolListItem = ({ item }) => {
  const [open, setOpen] = useState(false);
  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      <ListItemButton
        sx={{
          bgcolor: theme.palette.secondary.light,
          mb: 2,
          ":hover": {
            bgcolor: theme.palette.secondary.contrastText,
            color: theme.palette.secondary.main,
          },
        }}
        onClick={item.isExpandable ? handleClick : () => {}}
      >
        <ListItemIcon>
          <Square color="primary" />
        </ListItemIcon>
        <ListItemText primary={item.title} />
        <Cancel color="error" />
        {item.isExpandable ? (
          open ? (
            <ExpandLess color="primary" />
          ) : (
            <ExpandMore color="primary" />
          )
        ) : (
          <></>
        )}
      </ListItemButton>
      {item.isExpandable && open ? (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children?.map((child) => {
              return (
                <ListItemButton
                  key={child.id}
                  sx={{
                    bgcolor: theme.palette.secondary.light,
                    mb: 2,
                    ml: 10,
                    ":hover": {
                      bgcolor: theme.palette.secondary.contrastText,
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
              );
            })}
          </List>
        </Collapse>
      ) : (
        <></>
      )}
    </>
  );
};

export default PoolListItem;
