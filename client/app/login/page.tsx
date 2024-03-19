"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Box, Link, Stack, Typography } from "@mui/material";
import DefaultButton from "@/components/buttons/defaulButton";

export default function Login() {
  const router = useRouter();

  const handleLoginRequest = () => {
    console.log("Sending login request");
    const frontend_uri = process.env.NEXT_PUBLIC_FRONTEND_URI;
    const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI;
    console.log(process.env.NEXT_PUBLIC_BACKEND_URI)

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
    <Box
      width={"100%"}
      height={"100%"}
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "row-reverse",
        px: 18,
      }}
    >
      <Box justifyContent={"end"} display={"flex"} width={"100%"}>
        {/* <Typography className='text-3xl font-semibold text-[#1ED760]'>Stagnum</Typography> */}
      </Box>
      <Box
        display={"flex"}
        top={0}
        left={0}
        position={"absolute"}
        width={"100%"}
        height={"100%"}
      >
        <Image
          src={require("@/public/homeBG.jpg")}
          fill
          alt={"Home background"}
        />
      </Box>
      <Box
        display={"flex"}
        width={"100%"}
        height={"100%"}
        justifyContent={"center"}
        alignItems={"center"}
        flexDirection={"column"}
        minHeight={"100vh"}
        zIndex={1}
        color={"white"}
        gap={2}
      >
        <Stack spacing={1} direction={"row"} alignItems={"end"} ml={42}>
          <Typography fontSize={"1.25rem"} fontWeight={600}>
            For
          </Typography>
          <Image
            src={require("@/public/Spotify_Logo_RGB_Green.png")}
            width={120}
            height={70}
            alt={"Home background"}
            style={{ objectFit: "contain" }}
          />
        </Stack>
        <Image
          src={require("@/public/Stagnum_Logo.png")}
          width={500}
          height={100}
          alt={"Home background"}
          style={{ objectFit: "contain", marginTop: "-2.25rem" }}
        />

        <Typography variant="caption" fontSize={"2rem"}>
          Simplified Collaborative Listening
        </Typography>
        <Stack spacing={2} direction={"row"} mt={2} alignItems={"center"}>
          <Typography variant="h5" color={"white"}>
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
      </Box>
    </Box>
  );
}
