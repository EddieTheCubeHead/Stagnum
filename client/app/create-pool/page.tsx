"use client";
import {
  Box,
  CssBaseline,
  Grid,
  TextField,
  ThemeProvider,
} from "@mui/material";
import { Header1 } from "../components/textComponents";
import theme from "../utils/theme";
import React, { useState } from "react";
import DefaultButton from "../components/buttons/defaulButton";
import axios from "axios";

interface Props {
  token: string;
}

export default function CreatePool({ token }: Props) {
  const [poolName, setPoolName] = useState("");
  const [poolDesc, setPoolDesc] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchQuery = () => {
    axios
      .get("http://localhost:8000/search/tracks", {
        params: { searchQuery },
        headers: { token },
      })
      .then(function (response) {
        console.log(response.data.results);
      })
      .catch(() => {
        console.log("Request failed");
      });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
              <Grid item xs={10}>
                <TextField
                  label="Search"
                  value={searchQuery}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setSearchQuery(event.target.value);
                  }}
                  multiline
                  fullWidth
                />
              </Grid>
              <Grid
                item
                xs={2}
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <DefaultButton text="Search" action={handleSearchQuery} />
              </Grid>
            </Grid>
            <Grid item></Grid>
          </Grid>
          <Grid item xs={12} m={2}>
            <DefaultButton text="create" action={() => {}} />
          </Grid>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
