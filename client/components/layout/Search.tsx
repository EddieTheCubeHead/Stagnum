import theme from "@/utils/theme";
import Track from "@/types/trackTypes";
import {
  Box,
} from "@mui/material";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import SearchInput from "../inputfields.tsx/searchInput";
import { Header2 } from "../textComponents";
import Playlist from "@/types/playlistTypes";
import Album from "@/types/albumTypes";
import Artist from "@/types/artistTypes";
import AlbumCard from "./cards/albumCard";
import ArtistCard from "./cards/artistCard";

interface Props {
  token: string;
  handleAdd: (newAdd: Track | Album | Playlist | Artist) => void;
}

export default function Search({ token, handleAdd }: Props) {
  const mounted = useRef(false)
  const [query, setQuery] = useState("")
  const [trackList, setTrackList] = useState<Track[]>([])
  const [artistList, setArtistList] = useState<Artist[]>([])
  const [playlistList, setPlaylistList] = useState<Playlist[]>([])
  const [albumList, setAlbumList] = useState<Album[]>([])

  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const handleSearchRequest = (searchQuery: string) => {
    console.log("Searching song with:", searchQuery);

    axios
      .get("http://localhost:8000/search", {
        params: { query },
        headers: { token },
      })
      .then(function (response) {
        setTrackList(response.data.tracks.results)
        setAlbumList(response.data.albums.results)
        setArtistList(response.data.artists.results)
        setPlaylistList(response.data.playlists.results)
      })
      .catch((error) => {
        console.log("Request failed", error);
      });
  };

  const playlist: Playlist = {
    name: "90s Ambient Techno Mix",
    uri: "spotify:playlist:37i9dQZF1EIfMxLinpTxdB",
    icon_link:
      "https://seed-mix-image.spotifycdn.com/v6/img/desc/90s%20Ambient%20Techno/en/large",
  };

  const handelAdding = () => {
    handleAdd(playlist);
  };

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
    } else {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Set a timeout to execute the search after 2 seconds
      const timeout = setTimeout(() => {
        handleSearchRequest(query);
      }, 2000);

      // Save the timeout ID for cleanup
      setSearchTimeout(timeout);

      // Cleanup function to clear the timeout when component unmounts or when query changes
      return () => {
        if (searchTimeout) {
          clearTimeout(searchTimeout);
        }
      }
    }
  }, [query])

  return (
    <Box
      sx={{
        bgcolor: theme.palette.secondary.dark,
        width: "auto",
        height: "auto",
        borderRadius: 3,
        boxShadow: 2,
      }}
    >
      <SearchInput setQuery={setQuery} />
      {albumList &&
        <Box>
          <Header2 text={"Album"} />
          {albumList.slice(0, 5).map((album, key) => (
            <Box
              style={{
                position: "relative",
                width: "100%",
                paddingTop: "100%",
              }}
              key={key}
            >
              <AlbumCard album={album} handleAdd={handleAdd} />
            </Box>
          ))}
        </Box>
      }
      {artistList && (
        <Box>
          <Header2 text={"Artists"} />
          {artistList.slice(0, 5).map((artist, key) => (
            <Box
              style={{
                position: "relative",
                width: "100%",
                paddingTop: "100%",
              }}
              key={key}
            >
              <ArtistCard artist={artist} handleAdd={handleAdd} />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
