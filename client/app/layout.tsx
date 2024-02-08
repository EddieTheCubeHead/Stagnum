import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stagnum",
  description: "A pool-based playback handler for Spotify",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="relative flex w-full bg-black text-white h-screen overflow-hidden">
        <Sidebar />
        <main>{children}</main>
      </body>
    </html>
  );
}
