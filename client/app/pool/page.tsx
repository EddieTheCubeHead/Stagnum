"use client";
import PoolList from "@/components/lists/PoolList";
import { Header1 } from "@/components/textComponents";
import theme from "@/utils/theme";
import { Box, CssBaseline, Stack, ThemeProvider } from "@mui/material";
import React from "react";

const Pool = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          margin: 2,
        }}
      >
        <Stack>
          <Header1
            text="Your Pool"
            fontWeight={"bold"}
            sx={{ color: "white", pb: 4 }}
          />
          <PoolList />
        </Stack>
      </Box>
    </ThemeProvider>
  );
};

export default Pool;
