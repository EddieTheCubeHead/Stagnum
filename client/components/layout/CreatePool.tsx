import {
  Box,
  Card,
  CardMedia,
  Grid,
  IconButton,
  TextField,
} from "@mui/material";
import { Header1, Header3 } from "../textComponents";
import React, { useState } from "react";
import DefaultButton from "../buttons/defaulButton";
import Search from "./search";
import Track from "@/types/trackTypes";
import Album from "@/types/albumTypes";
import Playlist from "@/types/playlistTypes";
import DeleteIcon from "@mui/icons-material/Delete";

interface Props {
  token: string;
}

export default function CreatePool({ token }: Props) {
  const [poolName, setPoolName] = useState("");
  const [poolDesc, setPoolDesc] = useState("");
  const [selectedCollections, setSellectedCollections] = useState<
    Array<Track | Album | Playlist>
  >([
    {
      name: "90s Ambient Techno Mix",
      uri: "spotify:playlist:37i9dQZF1EIfMxLinpTxdB",
      icon_link:
        "https://seed-mix-image.spotifycdn.com/v6/img/desc/90s%20Ambient%20Techno/en/large",
    },
  ]);

  const handleAdd = (newAdd: Track | Album | Playlist) => {
    setSellectedCollections((curCollections) => [...curCollections, newAdd]);
  };

  const handleDelete = (itemToDelete: Track | Album | Playlist) => {
    setSellectedCollections((curCollections) =>
      curCollections.filter((collection) => collection !== itemToDelete)
    );
  };

  return (
    <Grid container sx={{ bgcolor: "secondary.main", borderRadius: 1 }}>
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
      <Grid
        item
        xs={12}
        container
        sx={{ bgcolor: "secondary.light", borderRadius: 1 }}
        m={2}
      >
        <Grid item xs={4} container rowGap={2} m={2} direction={"column"}>
          <Grid item>
            <TextField
              label="Pool name"
              fullWidth
              value={poolName}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setPoolName(event.target.value);
              }}
            />
          </Grid>
          <Grid item>
            <TextField
              label="Pool description"
              value={poolDesc}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setPoolDesc(event.target.value);
              }}
              multiline
              fullWidth
              rows={5}
            />
          </Grid>
        </Grid>
        <Grid item xs={7} container rowGap={2} m={2} direction={"column"}>
          <Grid item container>
            <Grid item xs={12}>
              <Search token={token} handleAdd={handleAdd} />
            </Grid>
          </Grid>
          <Grid item></Grid>
        </Grid>
        <Grid item xs={10} container direction={"row"}>
          {selectedCollections.map((item, key) => (
            <Grid item xs={2} key={key} container m={1}>
              <Card sx={{ bgcolor: "secondary.main" }}>
                <Grid
                  item
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  m={1}
                >
                  <CardMedia
                    component="img"
                    sx={{ width: 151 }}
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
              </Card>
            </Grid>
          ))}
        </Grid>
        <Grid
          item
          xs={2}
          marginY={2}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <DefaultButton text="create" action={() => {}} />
        </Grid>
      </Grid>
    </Grid>
  );
}
