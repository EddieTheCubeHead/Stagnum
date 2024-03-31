"use client";

import Footer from "@/components/layout/footer";
import { Box, CssBaseline, Grid, Stack } from "@mui/material";
import axios from "axios";
import { useSearchParams, redirect } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ThemeProvider } from "@emotion/react";
import theme from "../utils/theme";
import MainHeaderCard from "@/components/layout/mainHeaderCard";
import Album from "@/types/albumTypes";
import Artist from "@/types/artistTypes";
import Playlist from "@/types/playlistTypes";
import Track from "@/types/trackTypes";
import Search from "@/components/layout/search";
import ManagePool from "@/components/layout/managePool";
import '@/components/layout/css/customScrollBar.css';
import { Collections } from "@mui/icons-material";

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const [pool, setPool] = useState<Pool>({
    users: [],
    share_code: null
  });
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [selectedCollections, setSellectedCollections] = useState<Array<Album | Track | Artist | Playlist>>(
    []
  );
  const [token, setToken] = useState("");
  const queryParams = useSearchParams();
  const code = queryParams.get("code");
  const state = queryParams.get("state");
  const client_redirect_uri = process.env.NEXT_PUBLIC_FRONTEND_URI
  const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI

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
    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URI}/auth/login/callback`,
      { params: { state, code, client_redirect_uri } })
      .then(function (response) {
        setToken(response.data.access_token);
      })
      .catch((error) => {
        console.log("Request failed", error);
      });
  };

  // Function to add a new collection to a user
  const updatePool = (pool: Pool) => {
    setPool(pool);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        margin: 1.5,
        display: 'flex',
        height: 'calc(100vh - 80px)',
      }}>
        <Box
          sx={{
            flex: 1,
            padding: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 370
          }}
        >
          <MainHeaderCard />
          <ManagePool pool={pool} token={token} updatePool={updatePool} />
        </Box>
        <Search token={token} updatePool={updatePool} />
      </Box>
      <Footer token={token} />
    </ThemeProvider>
  );
}
