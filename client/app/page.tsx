"use client";

import Footer from "@/components/layout/footer";
import { Box, CssBaseline } from "@mui/material";
import axios from "axios";
import { useSearchParams } from "next/navigation";
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
  const client_redirect_uri = "http://localhost:80";

  useEffect(() => {
    if (code && state) {
      handleTokenRequest(code, state);
    }
  }, []);

  const handleTokenRequest = (code: string, state: string) => {
    console.log("Sending play request");

    axios
      .get("http://localhost:8080/auth/login/callback", {
        params: { state, code, client_redirect_uri },
      })
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
        <Footer />
      </Box>
    </ThemeProvider >
  );
}
