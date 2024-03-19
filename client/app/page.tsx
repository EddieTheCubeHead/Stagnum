"use client";

import Footer from "@/components/layout/footer";
import { Box, CssBaseline, Typography } from "@mui/material";
import axios from "axios";
import { useSearchParams, redirect } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ThemeProvider } from "@emotion/react";
import theme from "../utils/theme";
import MainHeaderCard from "@/components/layout/cards/mainHeaderCard";
import Album from "@/types/albumTypes";
import Artist from "@/types/artistTypes";
import Playlist from "@/types/playlistTypes";
import Track from "@/types/trackTypes";
import Search from "@/components/layout/search";
import ManagePool from "@/components/layout/managePool";

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const [pool, setPool] = useState<Array<Album | Track | Artist | Playlist>>(
    []
  );
  const [token, setToken] = useState("")
  const queryParams = useSearchParams();
  const code = queryParams.get("code");
  const state = queryParams.get("state");
  const client_redirect_uri = 'http://localhost:80'
  const backend_uri = 'http://localhost:8080'

  useEffect(() => {
    if (code && state) {
      handleTokenRequest(code, state);
    }
    // Delete when we have an actual routeguard
    else {
      //redirect('/login')
    }
  }, []);

  const handleTokenRequest = (code: string, state: string) => {
    console.log("Sending play request");

    axios.get(`${backend_uri}/auth/login/callback`,
      { params: { state, code, client_redirect_uri } })
      .then(function (response) {
        setToken(response.data.access_token);
      })
      .catch((error) => {
        console.log("Request failed", error);
      });
  };

  const handleAdd = (newAdd: Album | Track | Artist | Playlist) => {
    setPool((curPool) => [...curPool, newAdd])
  }

  const handleDelete = (itemToDelete: Album | Track | Artist | Playlist) => {
    setPool((curPool) =>
      curPool.filter((pool) => pool !== itemToDelete)
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        margin: 1.5,
        display: 'flex'
      }}>
        <Box
          sx={{
            flex: 1,
            padding: 1,
          }}
        >
          <MainHeaderCard />
          <ManagePool pool={pool} token={token} handleDelete={handleDelete} />
        </Box>
        <Search token={token} handleAdd={handleAdd} />
      </Box>
      <Footer token={token} />
    </ThemeProvider>
  );
}
