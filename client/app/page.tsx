"use client";

import Footer from "@/components/layout/footer";
import Search from "@/components/layout/search";
import SideMenu from "@/components/layout/sideMenu";
import { Box, CssBaseline, Grid, TextField } from "@mui/material";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ThemeProvider } from "@emotion/react";
import theme from "../utils/theme";

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
        console.log(response);
        setToken(response.data.access_token);
      })
      .catch((error) => {
        console.log("Request failed", error);
      });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          margin: 1,
        }}
      >
        <Grid container spacing={1} sx={{}}>
          <Grid item xs={3}>
            <SideMenu
              setShowSearchBar={setShowSearchBar}
              showSearchBar={showSearchBar}
            />
          </Grid>

          {showSearchBar == true && <Search token={token} />}
        </Grid>
      </Box>
      <Footer />
    </ThemeProvider>
  );
}
