"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Login() {
  const router = useRouter();
  const handleLoginRequest = () => {
    console.log("Sending login request");

    axios
      .get("http://localhost:8000/auth/login/no-redirect", {})
      .then(function (response) {
        console.log(response.data.url);
        router.push(response.data.url, { scroll: false });
      })
      .catch(() => {
        console.log("Request failed");
      });
  };

  return (
    <main className="relative min-h-screen w-full h-full flex px-36">
      <a href="/" className=" pt-4 w-full z-10">
        <h1 className="text-3xl font-semibold text-[#1ED760]">Stagnum</h1>
      </a>
      <div className="top-0 left-0 w-full h-full absolute flex">
        <Image
          src={require("@/public/homeBG.jpg")}
          fill
          alt={"Home background"}
        />
      </div>
      {/* <button onClick={handleLoginRequest}>Login button</button> */}
      <section
        className="flex text-black z-10 w-full h-full min-h-screen justify-center items-center flex-col
       gap-4"
      >
        <p className="text-xl text-black">Login with your Spotify</p>

        <button
          className="bg-[#1ED760] py-2 w-36 rounded-full text-xl font-semibold"
          onClick={handleLoginRequest}
        >
          Login
        </button>

        <div className="flex gap-4">
          <a href="/about">About Stagnum</a>
          <a
            href="https://github.com/EddieTheCubeHead/Stagnum/discussions"
            className="text-[#1ED760]"
            target="_blank"
          >
            Contact Us
          </a>
        </div>
      </section>
    </main>
  );
}
