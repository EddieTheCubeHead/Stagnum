import React from "react";
import ListSubheader from "@mui/material/ListSubheader";
import List from "@mui/material/List";
import PoolListItem from "./PoolListItem";

const PoolList = () => {
  const [open, setOpen] = React.useState(null);

  const poolList = [
    {
      id: 1,
      title: "Song Name",
      isExpandable: false,
    },
    {
      id: 2,
      title: "Album Name",
      isExpandable: true,
      children: [
        {
          title: "Song Name",
          isExpandable: false,
        },
        {
          title: "Song Name",
          isExpandable: false,
        },
        {
          title: "Song Name",
          isExpandable: false,
        },
      ],
    },
    {
      id: 3,
      title: "Song Name",
      isExpandable: false,
    },
    {
      id: 4,
      title: "Song Name",
      isExpandable: false,
    },
    {
      id: 5,
      title: "Album Name",
      isExpandable: true,
      children: [
        {
          title: "Song Name",
          isExpandable: false,
        },
        {
          title: "Song Name",
          isExpandable: false,
        },
      ],
    },
    {
      id: 5,
      title: "Song Name",
      isExpandable: false,
    },
  ];

  return (
    <List
      sx={{ width: "100%" }}
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader component="div" id="nested-list-subheader">
          {/* Your Pool */}
        </ListSubheader>
      }
    >
      {poolList.map((item) => {
        return <PoolListItem item={item} />;
      })}
    </List>
  );
};

export default PoolList;
