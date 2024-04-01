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
import { Header3 } from "@/components/textComponents";

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
  const [token, setToken] = useState("");
  const [expanded, setExpanded] = useState(false)
  const queryParams = useSearchParams();
  const code = queryParams.get("code");
  const state = queryParams.get("state");
  const client_redirect_uri = process.env.NEXT_PUBLIC_FRONTEND_URI

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

  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  const expandedGrid = (
    <Grid container spacing={1} alignItems='stretch'
      sx={{
        padding: 1,
        maxHeight: 'calc(100vh - 80px)'
      }}>
      <Grid item xs={3} sx={{ height: '10%' }}>
        <MainHeaderCard />
      </Grid>
      <Grid item xs={9} sx={{ height: '10%' }}>
        <Search token={token} updatePool={updatePool} expanded={expanded} toggleExpanded={toggleExpanded} />
      </Grid>
      <Grid item xs={12} sx={{ height: '90%', overflow: 'auto' }}>
        <ManagePool pool={pool} token={token} updatePool={updatePool} expanded={expanded} />
      </Grid>
    </Grid>
  )

  const collapsedGrid = (
    <Grid container spacing={1} direction='column' alignItems='stretch'
      sx={{
        padding: 1,
        maxHeight: 'calc(100vh - 80px)'
      }}>
      <Grid item xs={1.2} sx={{ height: '10%', width: '25%' }}>
        <MainHeaderCard />
      </Grid>
      <Grid item xs={10.8} sx={{ height: '10%', width: '25%', overflow: 'auto' }}>
        <ManagePool pool={pool} token={token} updatePool={updatePool} expanded={expanded} />
      </Grid>
      <Grid item xs={12} sx={{ height: '90%', width: '75%', overflow: 'auto' }}>
        <Search token={token} updatePool={updatePool} expanded={expanded} toggleExpanded={toggleExpanded} />
      </Grid>
    </Grid>
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {expanded ? (
        expandedGrid
      ) : (
        collapsedGrid
      )
      }
      <Footer token={token} />
    </ThemeProvider >
  );
}
