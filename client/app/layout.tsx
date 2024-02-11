import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./components/provider";

export const metadata: Metadata = {
  title: "Stagnum",
  description: "A pool-based playback handler for Spotify",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Providers>
        <body className="relative flex w-full bg-black text-white h-screen overflow-hidden">
          {children}
        </body>
      </Providers>
    </html>
  );
}
