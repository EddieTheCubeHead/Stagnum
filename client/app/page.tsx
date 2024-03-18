"use client";

import Footer from "@/components/layout/footer";
import { Box, CssBaseline } from "@mui/material";
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
import BetterSearch from "@/components/layout/betterSearch";

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const [selectedCollections, setSellectedCollections] = useState<Array<Album | Track | Artist | Playlist>>(
    []
  );
  const [query, setQuery] = useState("")
  const [token, setToken] = useState("")
  const queryParams = useSearchParams();
  const code = queryParams.get("code");
  const state = queryParams.get("state");
  const client_redirect_uri = process.env.NEXT_PUBLIC_FRONTEND_URI
  const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI_ROOT

  useEffect(() => {
    if (code && state) {
      handleTokenRequest(code, state);
    }
    // Delete when we have an actual routeguard
    else {
      redirect('/login')
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
    setSellectedCollections((curCollections) => [...curCollections, newAdd])
  }

  const handleDelete = (itemToDelete: Album | Track | Artist | Playlist) => {
    setSellectedCollections((curCollections) =>
      curCollections.filter((collection) => collection !== itemToDelete)
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
        </Box>
        <BetterSearch token={token} handleAdd={handleAdd} />
      </Box>
      <Footer token={token} />
    </ThemeProvider>
  );
}
