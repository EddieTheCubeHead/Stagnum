"use client";

import Footer from "@/components/layout/footer";
import Search from "@/components/layout/search";
import SideMenu from "@/components/layout/sideMenu";
import {
  Box,
  CssBaseline,
  Grid,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ThemeProvider } from "@emotion/react";
import theme from "../utils/theme";
import CreatePool from "@/components/layout/CreatePool";
import { Header1, Header2 } from "@/components/textComponents";

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
        <Grid container gap={1}>
          <Grid item xs={2}>
            <Box
              sx={{
                bgcolor: "secondary.dark",
                width: "auto",
                height: "auto",
                borderRadius: 3,
                boxShadow: 2,
              }}
            >
              <List>
                <ListItemButton
                  sx={{
                    bgcolor: "secondary.main",
                    m: 1,
                    borderRadius: 2,
                  }}
                  onClick={() => handlePageChange("search")}
                >
                  <ListItemText>
                    <Header2 text="Search" fontWeight={"bold"} />
                  </ListItemText>
                </ListItemButton>
                <ListItemButton
                  sx={{
                    bgcolor: "secondary.main",
                    m: 1,
                    borderRadius: 2,
                  }}
                  onClick={() => handlePageChange("create")}
                >
                  <ListItemText>
                    <Header2 text="Create" fontWeight={"bold"} />
                  </ListItemText>
                </ListItemButton>
              </List>
            </Box>
          </Grid>

          {showSearchBar && <Search token={token} />}
          {showCreatePool && (
            <Grid item xs={9}>
              <CreatePool token={token} />
            </Grid>
          )}
          {!showSearchBar && !showCreatePool ? (
            <Grid
              item
              xs={9}
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
        </Grid>
      </Box>
      <Footer />
    </ThemeProvider>
  );
}
