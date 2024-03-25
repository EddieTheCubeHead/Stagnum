"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { Box, Grid, Link, Stack, Typography } from "@mui/material";
import DefaultButton from "@/components/buttons/defaulButton";
import Image from "next/image";
import theme from "../utils/theme";

export default function Login() {
  const router = useRouter();

  const handleLoginRequest = () => {
    console.log("Sending login request");
    const frontend_uri = process.env.NEXT_PUBLIC_FRONTEND_URI;
    const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI;

    axios
      .get(`${backend_uri}/auth/login`, {
        params: { frontend_uri },
      })
      .then(function (response) {
        console.log(response.data.redirect_uri);
        router.push(response.data.redirect_uri);
      })
      .catch(() => {
        console.log("Request failed");
      });
  };

  return (
    // <Box
    //   height={"100%"}
    //   sx={{
    //     minHeight: "100vh",
    //     display: "flex",
    //     flexDirection: "row-reverse",
    //     px: 18,
    //   }}
    // >
    //   <Box justifyContent={"end"} display={"flex"} width={"100%"}>
    //     {/* <Typography className='text-3xl font-semibold text-[#1ED760]'>Stagnum</Typography> */}
    //   </Box>
    //   <Box
    //     display={"flex"}
    //     top={0}
    //     left={0}
    //     position={"absolute"}
    //     width={"100%"}
    //     height={"100%"}
    //   >
    //     <Image
    //       src={require("@/public/homeBG.jpg")}
    //       fill
    //       alt={"Home background"}
    //     />
    //   </Box>
    //   <Box
    //     display={"flex"}
    //     width={"100%"}
    //     height={"100%"}
    //     justifyContent={"center"}
    //     alignItems={"center"}
    //     flexDirection={"column"}
    //     minHeight={"100vh"}
    //     zIndex={1}
    //     color={"white"}
    //     gap={2}
    //   >
    //     <Stack spacing={1} direction={"row"} alignItems={"end"} ml={42}>
    //       <Typography fontSize={"1.25rem"} fontWeight={600}>
    //         For
    //       </Typography>
    //       <Image
    //         src={require("@/public/Spotify_Logo_RGB_Green.png")}
    //         width={120}
    //         height={40}
    //         alt={"Home background"}
    //         style={{ objectFit: "contain" }}
    //       />
    //     </Stack>
    //     <Image
    //       src={require("@/public/Stagnum_Logo.png")}
    //       width={500}
    //       height={100}
    //       alt={"Home background"}
    //       style={{ objectFit: "contain", marginTop: "-2.25rem" }}
    //     />

    //     <Typography variant="caption" fontSize={{ lg: "2rem", md: "1.8rem" }}>
    //       Simplified Collaborative Listening
    //     </Typography>
    //     <Stack spacing={2} direction={"row"} mt={2} alignItems={"center"}>
    //       <Typography variant="h5" color={"white"}>
    //         Login with your Spotify
    //       </Typography>

    //       <DefaultButton action={handleLoginRequest} text="Login" />
    //     </Stack>

    //     <Box display={"flex"} gap={2}>
    //       <Link href="/about" color={"#ffffff"}>
    //         About Stagnum
    //       </Link>
    //       <Link
    //         href="https://github.com/EddieTheCubeHead/Stagnum/discussions"
    //         color={"#42b74c"}
    //         target="_blank"
    //       >
    //         Contact Us
    //       </Link>
    //     </Box>
    //   </Box>
    // </Box>
    <Grid
      container
      spacing={2}
      bgcolor={"black"}
      sx={{ minHeight: "100vh", margin: 0 }}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <Grid
        item
        xs={12}
        sm={6}
        justifyContent={"center"}
        alignItems={"center"}
        display={"flex"}
        flexDirection={"column"}
        gap={2}
        zIndex={1}
      >
        <Stack
          spacing={1}
          direction={"row"}
          alignItems={"end"}
          ml={{ xs: 13, sm: 25, lg: 42 }}
          mb={-3}
        >
          <Typography fontSize={"1.25rem"} fontWeight={600} color={"white"}>
            For
          </Typography>
          <Image
            src={require("@/public/Spotify_Logo_RGB_Green.png")}
            width={120}
            height={40}
            alt={"Home background"}
            style={{ objectFit: "contain" }}
          />
        </Stack>
        <Stack
          width={{ xs: 280, sm: 400, lg: 500 }}
          height={{ xs: 50, sm: 70, lg: 100 }}
          display={"flex"}
          position={"relative"}
        >
          <Image
            src={require("@/public/Stagnum_Logo.png")}
            alt={"Home background"}
            fill
            style={{
              objectFit: "contain",
              flex: 1,
            }}
          />
        </Stack>
        <Typography
          variant="caption"
          fontSize={{ lg: "2rem", sm: "1.8rem", xs: "1.5rem" }}
          color={"white"}
          textAlign={"center"}
        >
          Simplified Collaborative Listening
        </Typography>
        <Stack spacing={2} direction={"row"} mt={2} alignItems={"center"}>
          <Typography
            variant="h5"
            color={"white"}
            fontSize={{ xs: "1.2rem", md: "1.8rem" }}
          >
            Login with your Spotify
          </Typography>

          <DefaultButton action={handleLoginRequest} text="Login" />
        </Stack>

        <Box display={"flex"} gap={2}>
          <Link href="/about" color={"#ffffff"}>
            About Stagnum
          </Link>
          <Link
            href="https://github.com/EddieTheCubeHead/Stagnum/discussions"
            color={"#42b74c"}
            target="_blank"
          >
            Contact Us
          </Link>
        </Box>
      </Grid>
      <Grid item xs={12} sm={6} display={{ xs: "none", sm: "flex" }}>
        <Image
          src={require("@/public/homeBG.jpg")}
          fill
          alt={"Home background"}
        />
      </Grid>
    </Grid>
  );
}
