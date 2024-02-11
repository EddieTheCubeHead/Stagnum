"use client";
import { useSession } from "next-auth/react";
import PlaylistView from "./components/PlaylistView";
import Sidebar from "./components/Sidebar";
import Player from "./components/Player";
import { useState } from "react";

export default function Home() {
  const { data: session } = useSession();

  const [view, setView] = useState("search"); // ["search", "library", "playlist", "artist"]
  const [globalPlaylistId, setGlobalPlaylistId] = useState(null);
  const [globalArtistId, setGlobalArtistId] = useState(null);
  const [globalCurrentSongId, setGlobalCurrentSongId] = useState(null);
  const [globalIsTrackPlaying, setGlobalIsTrackPlaying] = useState(false);
  console.log("Playlist ID Global ::: ", globalPlaylistId);

  return (
    <main className="h-screen overflow-hidden bg-black w-full flex">
      <Sidebar
        view={view}
        setView={setView}
        setGlobalPlaylistId={setGlobalPlaylistId}
      />
      <div className="flex w-full flex-1 h-full flex-col">
        {view === "playlist" && (
          <PlaylistView
            setView={setView}
            setGlobalArtistId={setGlobalArtistId}
            globalPlaylistId={globalPlaylistId}
            setGlobalCurrentSongId={setGlobalCurrentSongId}
            setGlobalIsTrackPlaying={setGlobalIsTrackPlaying}
          />
        )}
        <div className="sticky z-20 bottom-0 w-full">
          <Player
            globalCurrentSongId={globalCurrentSongId}
            setGlobalCurrentSongId={setGlobalCurrentSongId}
            setGlobalIsTrackPlaying={setGlobalIsTrackPlaying}
            globalIsTrackPlaying={globalIsTrackPlaying}
          />
        </div>
      </div>
    </main>
  );
}
