"use client";

import axios from "axios";
import { redirect, useRouter } from "next/navigation";
import Image from "next/image";
import { Box, Button, Link, Stack, Typography } from "@mui/material";

export default function Login() {
  const router = useRouter();

  const handleLoginRequest = () => {
    console.log("Sending login request");
    const client_redirect_uri = "http://localhost:80";

    axios
      .get("http://localhost:8080/auth/login", {
        params: { client_redirect_uri },
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
    <main className="relative min-h-screen w-full h-full flex flex-row-reverse px-24">
      <Box className=" pt-4 w-full z-10 justify-end flex">
        {/* <Typography className='text-3xl font-semibold text-[#1ED760]'>Stagnum</Typography> */}
      </Box>
      <Box className="top-0 left-0 w-full h-full absolute flex">
        <Image
          src={require("@/public/homeBG.jpg")}
          fill
          alt={"Home background"}
        />
      </Box>
      <Box
        className="flex text-white z-10 w-full h-full min-h-screen justify-center items-center flex-col
       gap-4"
      >
        <Stack
          spacing={1}
          direction={"row"}
          alignItems={"end"}
          className="ml-[21rem]"
        >
          <Typography className="text-xl font-semibold">For</Typography>
          <Image
            src={require("@/public/Spotify_Logo_RGB_Green.png")}
            width={120}
            height={70}
            alt={"Home background"}
            className="object-contain"
          />
        </Stack>
        <Image
          src={require("@/public/Stagnum_Logo.png")}
          width={500}
          height={400}
          alt={"Home background"}
          className="object-contain -mt-8"
        />

        <Typography className="text-3xl">
          Simplified Collaborative Listening
        </Typography>
        <Stack spacing={1} direction={"row"} className="mt-4 items-center">
          <Typography className="text-xl text-white">
            Login with your Spotify
          </Typography>

          <Button
            className="bg-[#42b74c] py-2 w-36 rounded-full text-xl font-semibold text-white hover:bg-white hover:text-[#42b74c]"
            onClick={handleLoginRequest}
          >
            Login
          </Button>
        </Stack>

        <Box className="flex gap-4">
          <Link href="/about" className="text-white">
            About Stagnum
          </Link>
          <Link
            href="https://github.com/EddieTheCubeHead/Stagnum/discussions"
            className="text-[#42b74c]"
            target="_blank"
          >
            Contact Us
          </Link>
        </Box>
      </Box>
    </main>
  );
}
