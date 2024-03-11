import React from "react";
import ListSubheader from "@mui/material/ListSubheader";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import DraftsIcon from "@mui/icons-material/Drafts";
import SendIcon from "@mui/icons-material/Send";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import StarBorder from "@mui/icons-material/StarBorder";
import { Square, SquareOutlined } from "@mui/icons-material";

const PoolList = () => {
  const [open, setOpen] = React.useState(true);

  const handleClick = () => {
    setOpen(!open);
  };
  return (
    <List
      sx={{ width: "100%", bgcolor: "background.paper" }}
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader component="div" id="nested-list-subheader">
          {/* Your Pool */}
        </ListSubheader>
      }
    >
      <ListItemButton>
        <ListItemIcon>
          <Square />
        </ListItemIcon>
        <ListItemText primary="Song Name" />
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <Square />
        </ListItemIcon>
        <ListItemText primary="Song Name" />
      </ListItemButton>
      <ListItemButton onClick={handleClick}>
        <ListItemIcon>
          <Square />
        </ListItemIcon>
        <ListItemText primary="Album Name" />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton sx={{ pl: 8 }}>
            <ListItemIcon>
              <Square />
            </ListItemIcon>
            <ListItemText primary="Song Name" />
          </ListItemButton>
          <ListItemButton sx={{ pl: 8 }}>
            <ListItemIcon>
              <Square />
            </ListItemIcon>
            <ListItemText primary="Song Name" />
          </ListItemButton>
          <ListItemButton sx={{ pl: 8 }}>
            <ListItemIcon>
              <Square />
            </ListItemIcon>
            <ListItemText primary="Song Name" />
          </ListItemButton>
        </List>
      </Collapse>
    </List>
  );
};

export default PoolList;
