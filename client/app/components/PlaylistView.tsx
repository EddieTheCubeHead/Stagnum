import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { shuffle } from "lodash";
import { signOut, useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import Song from "./Song";

const colors = [
  "from-indigo-500",
  "from-blue-500",
  "from-green-500",
  "from-red-500",
  "from-yellow-500",
  "from-pink-500",
  "from-purple-500",
];

const PlaylistView = ({
  globalPlaylistId,
  setGlobalCurrentSongId,
  setGlobalIsTrackPlaying,
  setView,
  setGlobalArtistId,
}: any) => {
  const { data: session } = useSession();
  const [playlistData, setPlaylistData] = useState(null);
  const [color, setColor] = useState(colors[0]);
  const [opacity, setOpacity] = useState(0);
  const [textOpacity, setTextOpacity] = useState(0);

  function changeOpacity(scrollPos) {
    // scrollPos = 0 -> opacity = 0
    // scrollPos = 300 -> opacity = 1, textOpacity = 0
    // scrollPos = 310 -> opacity = 1, textOpacity = 1
    const offset = 300;
    const textOffset = 10;
    if (scrollPos < offset) {
      const newOpacity = 1 - (offset - scrollPos) / offset;
      setOpacity(newOpacity);
      setTextOpacity(0);
    } else {
      setOpacity(1);
      const delta = scrollPos - offset;
      const newTextOpacity = 1 - (textOffset - delta) / textOffset;
      setTextOpacity(newTextOpacity);
    }
  }

  useEffect(() => {
    async function f() {
      if (session && session.accessToken) {
        console.log(session);
        const response = await fetch(
          `https://api.spotify.com/v1/playlists/${globalPlaylistId}`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );
        const data = await response.json();
        setPlaylistData(data);
      }
    }
    f();
  }, [session, globalPlaylistId]);

  useEffect(() => {
    setColor(shuffle(colors).pop());
  }, [globalPlaylistId]);
  console.log("PLAYLIST ::: ", playlistData, globalPlaylistId);

  return (
    <div className="flex-1 h-screen w-full flex flex-col">
      <header
        style={{ opacity: opacity }}
        className="text-white sticky top-0 h-20 z-10 text-4xl bg-neutral-800 flex items-center font-bold"
      >
        <div style={{ opacity: textOpacity }} className="flex items-center">
          {playlistData !== null &&
            Object.keys(playlistData).length > 0 &&
            playlistData && (
              <img className="h-8 w-8 mr-6" src={playlistData?.images[0].url} />
            )}
          <p>{playlistData?.name}</p>
        </div>
      </header>
      <div
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="absolute z-20 top-5 right-8 flex items-center bg-black bg-opacity-70 text-white space-x-3 opacity-90 hover:opacity-80 cursor-pointer rounded-full p-1 pr-2"
      >
        <img
          className="rounded-full w-7 h-7"
          src={session?.user.image}
          alt="profile pic"
        />
        <p className="text-sm">Logout</p>
        <ChevronDownIcon className="h-5 w-5" />
      </div>
      <div
        onScroll={(e) => changeOpacity(e.target.scrollTop)}
        className="relative -top-20 h-screen overflow-y-scroll bg-neutral-900"
      >
        <div className="text-white px-8 flex flex-col space-y-1 pb-28">
          {playlistData !== null &&
            Object.keys(playlistData).length > 0 &&
            playlistData?.tracks?.items.map((track, i) => {
              // song component
              return (
                <Song
                  setView={setView}
                  setGlobalArtistId={setGlobalArtistId}
                  setGlobalIsTrackPlaying={setGlobalIsTrackPlaying}
                  setGlobalCurrentSongId={setGlobalCurrentSongId}
                  key={track.track.id}
                  sno={i}
                  track={track.track}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default PlaylistView;
