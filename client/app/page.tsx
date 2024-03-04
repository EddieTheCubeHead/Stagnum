"use client";

import Footer from "@/components/layout/footer";
import Search from "@/components/layout/search";
import SideMenu from "@/components/layout/sideMenu";
import { Box, CssBaseline, Grid, Stack, TextField } from "@mui/material";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ThemeProvider } from "@emotion/react";
import theme from "../utils/theme";
import MainHeaderCard from "@/components/layout/mainHeaderCard";
import CreatePool from "@/components/layout/createPool";
import { Header1 } from "@/components/textComponents";
import Album from "@/types/albumTypes";
import Artist from "@/types/artistTypes";
import Playlist from "@/types/playlistTypes";
import Track from "@/types/trackTypes";

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showCreatePool, setShowCreatePool] = useState(false);
  const [token, setToken] = useState("");
  const queryParams = useSearchParams();
  const code = queryParams.get("code");
  const state = queryParams.get("state");
  const client_redirect_uri = "http://localhost:3000";

  useEffect(() => {
    if (code && state) {
      handleTokenRequest(code, state);
    }
  }, []);

  const handleTokenRequest = (code: string, state: string) => {
    console.log("Sending play request");

    axios
      .get("http://localhost:8000/auth/login/callback", {
        params: { state, code, client_redirect_uri },
      })
      .then(function (response) {
        setToken(response.data.access_token);
      })
      .catch((error) => {
        console.log("Request failed", error);
      });
  };

  const handlePageChange = (page: string) => {
    switch (page) {
      case "search": {
        setShowSearchBar((prev) => !prev);
        setShowCreatePool(false);
        break;
      }
      case "create": {
        setShowCreatePool((prevCheck) => !prevCheck);
        setShowSearchBar(false);
        break;
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          margin: 1,
        }}
      >
        <Stack spacing={1}>
          <MainHeaderCard />
          <SideMenu
            setShowSearchBar={setShowSearchBar}
            showSearchBar={showSearchBar}
            token={token}
          />
        </Stack>
        {showSearchBar && (
          <Search
            token={token}
            handleAdd={function (
              newAdd: Track | Album | Playlist | Artist
            ): void {
              throw new Error("Function not implemented.");
            }}
          />
        )}
        {showCreatePool && (
          <Grid item xs={9}>
            <CreatePool token={token} />
          </Grid>
        )}
        {!showSearchBar && !showCreatePool ? (
          <Grid
            item
            xs={10}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Header1
              text="Welcome to Stagnum!"
              color={"primary.main"}
              fontWeight={"bold"}
            />
          </Grid>
        ) : null}
      </Box>
      <Footer />
    </ThemeProvider>
  );
}
