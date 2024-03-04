import { Box, Card, CardMedia, Grid, IconButton } from "@mui/material";
import { Header1, Header3 } from "../textComponents";
import React, { useState } from "react";
import DefaultButton from "../buttons/defaulButton";
import Search from "./Search";
import Track from "@/types/trackTypes";
import Album from "@/types/albumTypes";
import Playlist from "@/types/playlistTypes";
import DeleteIcon from "@mui/icons-material/Delete";
import Artist from "@/types/artistTypes";
import axios from "axios";

interface Props {
  token: string;
}

export default function CreatePool({ token }: Props) {
  const [selectedCollections, setSellectedCollections] = useState<
    Array<Track | Album | Playlist | Artist>
  >([]);

  const createPool = () => {
    const requestData = {
      spotify_uris: [
        {
          spotify_uri: selectedCollections[0].uri,
        },
      ],
    };

    axios
      .post("http://localhost:8000/pool", requestData, {
        headers: { token },
      })
      .then(function (response) {
        console.log(response);
      })
      .catch((error) => {
        console.log("Request failed", error);
      });
  };

  const handleAdd = (newAdd: Track | Album | Playlist | Artist) => {
    setSellectedCollections((curCollections) => [...curCollections, newAdd]);
  };

  const handleDelete = (itemToDelete: Track | Album | Playlist | Artist) => {
    setSellectedCollections((curCollections) =>
      curCollections.filter((collection) => collection !== itemToDelete)
    );
  };

  return (
    <Grid
      container
      sx={{
        bgcolor: "secondary.main",
        borderRadius: 1,
      }}
    >
      <Grid
        item
        xs={12}
        m={2}
        sx={{ bgcolor: "primary.main", borderRadius: 1 }}
      >
        <Box m={1}>
          <Header1 text="Create a Pool" fontWeight={"bold"} />
        </Box>
      </Grid>

      <Grid item xs={9}>
        <Search token={token} handleAdd={handleAdd} />
        <Grid item></Grid>
      </Grid>
      <Grid
        item
        xs={3}
        container
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        {selectedCollections.map((item, key) => (
          <Grid
            item
            xs={5}
            key={key}
            container
            direction={"column"}
            display="flex"
            justifyContent="center"
            alignItems="center"
            m={1}
            sx={{ bgcolor: "secondary.light", borderRadius: 1 }}
          >
            <Grid
              item
              display="flex"
              justifyContent="center"
              alignItems="center"
              m={1}
            >
              <CardMedia
                component="img"
                image={item.icon_link}
                alt={item.name}
              />
            </Grid>
            <Grid
              item
              display="flex"
              justifyContent="center"
              alignItems="center"
              m={1}
            >
              <Header3 fontWeight={"bold"} text={item.name} />
              <IconButton onClick={() => handleDelete(item)}>
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        ))}
      </Grid>
      <Grid
        item
        xs={12}
        marginY={2}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <DefaultButton text="create" action={createPool} />
      </Grid>
    </Grid>
  );
}
