import React from "react";
import ListSubheader from "@mui/material/ListSubheader";
import List from "@mui/material/List";
import PoolListItem from "./PoolListItem";

const PoolList = () => {
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
          title: "Song Name",
          isExpandable: false,
        },
      ],
    },
    {
      id: 6,
      title: "Song Name",
      isExpandable: false,
    },
    {
      id: 7,
      title: "Song Name",
      isExpandable: false,
    },
    {
      id: 8,
      title: "Album Name",
      isExpandable: true,
      children: [
        {
          id: 9,
          title: "Song Name",
          isExpandable: false,
        },
        {
          id: 10,
          title: "Song Name",
          isExpandable: false,
        },
      ],
    },
    {
      id: 11,
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
        return <PoolListItem item={item} key={item.id} />;
      })}
    </List>
  );
};

export default PoolList;
