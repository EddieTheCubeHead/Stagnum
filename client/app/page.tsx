'use client'

import { Avatar, Box, Button, List, ListItem, ListItemButton, ListItemText, TextField, ThemeProvider, Typography } from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import theme from '@/services/stagnumTheme'

export default function Home() {
  const [showSearchBar, setShowSearchBar] = useState(false)

  return (
    <main>
      <ThemeProvider theme={theme}>
        <Box sx={{ bgcolor: theme.palette.primary.light }} className="relative min-h-screen flex flex-col w-full h-full">

          <Box sx={{ bgcolor: theme.palette.primary.main }} className="fixed flex flex-col h-full px-12 py-16 w-96">
            <List>
              <ListItemButton sx={{}} onClick={() => setShowSearchBar(!showSearchBar)}>
                <ListItemText>Search</ListItemText>
              </ListItemButton>
            </List>
          </Box>

          <Box className="relative flex flex-col h-full ml-96">
            <Avatar sx={{ margin: 2 }} className="absolute right-0 h-20 w-20" >My Profile</Avatar>
            <Box sx={{}}>
              {showSearchBar == true &&
                <TextField
                  sx={{ margin: 4, width: 500 }}
                  id="standard-search"
                  label="Search field"
                  type="search"
                  variant="standard"
                />
              }
            </Box>
            <Box sx={{ bgcolor: theme.palette.primary.dark }} className="fixed bottom-0 left-0 w-full py-4 px-12 flex">
              <Box className="flex gap-4 w-96">
                <Link href="/about">About Stagnum</Link>
                <Link
                  href="https://github.com/EddieTheCubeHead/Stagnum/discussions"
                  target="_blank"
                  className="text-[#1ED760]"
                >
                  Contact Us
                </Link>
              </Box>
              <Typography>Media Player</Typography>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </main >
  );
}
