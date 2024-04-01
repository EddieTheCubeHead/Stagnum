"use client";

import Footer from "@/components/layout/footer";
import { Box, Collapse, CssBaseline, Grid, Stack } from "@mui/material";
import axios from "axios";
import { useSearchParams, redirect } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ThemeProvider } from "@emotion/react";
import theme from "../utils/theme";
import MainHeaderCard from "@/components/layout/cards/mainHeaderCard";
import Search from "@/components/layout/search";
import PoolManager from "@/components/layout/poolManager";
import '@/components/layout/css/customScrollBar.css';
import ExpandedSearchContent from "@/components/layout/expandedSearchContent";
import Track from "@/types/trackTypes";
import Artist from "@/types/artistTypes";
import Playlist from "@/types/playlistTypes";
import Album from "@/types/albumTypes";

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const [pool, setPool] = useState<Pool>({
    users: [],
    share_code: null
  });
  const [token, setToken] = useState("");
  const [expanded, setExpanded] = useState(false)
  const [trackList, setTrackList] = useState<Track[]>([])
  const [artistList, setArtistList] = useState<Artist[]>([])
  const [playlistList, setPlaylistList] = useState<Playlist[]>([])
  const [albumList, setAlbumList] = useState<Album[]>([])
  const [disabled, setDisabled] = useState(true)
  const queryParams = useSearchParams();
  const code = queryParams.get("code");
  const state = queryParams.get("state");
  const client_redirect_uri = process.env.NEXT_PUBLIC_FRONTEND_URI

  useEffect(() => {
    if (code && state) {
      handleTokenRequest(code, state);
    }
    // Delete when we have an actual routeguard
    else {
      //redirect('/login')
    }
  }, []);

  const handleTokenRequest = (code: string, state: string) => {
    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URI}/auth/login/callback`,
      { params: { state, code, client_redirect_uri } })
      .then(function (response) {
        setToken(response.data.access_token);
      })
      .catch((error) => {
        console.log("Request failed", error);
      });
  };

  // Function to add a new collection to a user
  const updatePool = (pool: Pool) => {
    setPool(pool);
  };

  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  const enableAddButton = () => {
    setDisabled(false)
  }

  const setSearchResults = (data: any) => {
    setTrackList(data.tracks.results)
    setAlbumList(data.albums.results)
    setArtistList(data.artists.results)
    setPlaylistList(data.playlists.results)
  }

  const response = {
    "tracks": {
      "limit": 20,
      "offset": 0,
      "total": 98,
      "self_page_link": "https://api.spotify.com/v1/search?query=JOu&type=track&offset=0&limit=20",
      "next_page_link": "https://api.spotify.com/v1/search?query=JOu&type=track&offset=20&limit=20",
      "results": [
        {
          "name": "Don't Stop Believin'",
          "link": "https://api.spotify.com/v1/tracks/77NNZQSqzLNqh2A9JhLRkg",
          "uri": "spotify:track:77NNZQSqzLNqh2A9JhLRkg",
          "artists": [
            {
              "name": "Journey",
              "link": "https://api.spotify.com/v1/artists/0rvjqX7ttXeg3mTy8Xscbt"
            }
          ],
          "album": {
            "name": "The Essential Journey",
            "link": "https://api.spotify.com/v1/albums/5pfpXvoJtSIFrbPIoBEv3R",
            "uri": "spotify:album:5pfpXvoJtSIFrbPIoBEv3R",
            "artists": [
              {
                "name": "Journey",
                "link": "https://api.spotify.com/v1/artists/0rvjqX7ttXeg3mTy8Xscbt"
              }
            ],
            "year": 2001,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b2730f6ce5c138493ac768d9afc8"
          },
          "duration_ms": 248906
        },
        {
          "name": "Separate Ways (Worlds Apart) [2023 Remaster]",
          "link": "https://api.spotify.com/v1/tracks/1pTw2cNrp9L3esxLAvWnN2",
          "uri": "spotify:track:1pTw2cNrp9L3esxLAvWnN2",
          "artists": [
            {
              "name": "Journey",
              "link": "https://api.spotify.com/v1/artists/0rvjqX7ttXeg3mTy8Xscbt"
            }
          ],
          "album": {
            "name": "Frontiers (2023 Remaster)",
            "link": "https://api.spotify.com/v1/albums/3pZ6D15onAaT2YyiTbcHmh",
            "uri": "spotify:album:3pZ6D15onAaT2YyiTbcHmh",
            "artists": [
              {
                "name": "Journey",
                "link": "https://api.spotify.com/v1/artists/0rvjqX7ttXeg3mTy8Xscbt"
              }
            ],
            "year": 1983,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b2735faa719b168dfd8c46f7aaeb"
          },
          "duration_ms": 323453
        },
        {
          "name": "Joutsenet",
          "link": "https://api.spotify.com/v1/tracks/0B6W9Dztl02TtvTYIhbcOs",
          "uri": "spotify:track:0B6W9Dztl02TtvTYIhbcOs",
          "artists": [
            {
              "name": "PMMP",
              "link": "https://api.spotify.com/v1/artists/6LUnsRyqOZdHGTZqMlWVV2"
            }
          ],
          "album": {
            "name": "Kuulkaas Enot!",
            "link": "https://api.spotify.com/v1/albums/0td98OkILwPLsqzC95k642",
            "uri": "spotify:album:0td98OkILwPLsqzC95k642",
            "artists": [
              {
                "name": "PMMP",
                "link": "https://api.spotify.com/v1/artists/6LUnsRyqOZdHGTZqMlWVV2"
              }
            ],
            "year": 2003,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b2733ed4e0fe0f9b3fdd7300b60a"
          },
          "duration_ms": 250693
        },
        {
          "name": "Separate Ways",
          "link": "https://api.spotify.com/v1/tracks/4NiyMmBdlVHpZWScgdBvnt",
          "uri": "spotify:track:4NiyMmBdlVHpZWScgdBvnt",
          "artists": [
            {
              "name": "Journey",
              "link": "https://api.spotify.com/v1/artists/0rvjqX7ttXeg3mTy8Xscbt"
            }
          ],
          "album": {
            "name": "Revelation",
            "link": "https://api.spotify.com/v1/albums/592hffmAvSd1gNwTW9dNEb",
            "uri": "spotify:album:592hffmAvSd1gNwTW9dNEb",
            "artists": [
              {
                "name": "Journey",
                "link": "https://api.spotify.com/v1/artists/0rvjqX7ttXeg3mTy8Xscbt"
              }
            ],
            "year": 2008,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b2738cee5fd199821bd46d9dec04"
          },
          "duration_ms": 327786
        },
        {
          "name": "Joutsenlaulu",
          "link": "https://api.spotify.com/v1/tracks/64g13jywmPm2oUt5CsCqx0",
          "uri": "spotify:track:64g13jywmPm2oUt5CsCqx0",
          "artists": [
            {
              "name": "Kirkkovene",
              "link": "https://api.spotify.com/v1/artists/0SZkRVbgQe92d3RdjmYh9f"
            }
          ],
          "album": {
            "name": "Joutsenlaulu",
            "link": "https://api.spotify.com/v1/albums/1JzDveXledxfzOKa0xUZxg",
            "uri": "spotify:album:1JzDveXledxfzOKa0xUZxg",
            "artists": [
              {
                "name": "Kirkkovene",
                "link": "https://api.spotify.com/v1/artists/0SZkRVbgQe92d3RdjmYh9f"
              }
            ],
            "year": 2020,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b27347b735693d33306d54967d18"
          },
          "duration_ms": 305238
        },
        {
          "name": "Any Way You Want It",
          "link": "https://api.spotify.com/v1/tracks/71SvEDmsOwIWw1IozsZoMA",
          "uri": "spotify:track:71SvEDmsOwIWw1IozsZoMA",
          "artists": [
            {
              "name": "Journey",
              "link": "https://api.spotify.com/v1/artists/0rvjqX7ttXeg3mTy8Xscbt"
            }
          ],
          "album": {
            "name": "Departure",
            "link": "https://api.spotify.com/v1/albums/2OyVtIEp7O7a6o82DF4Ba5",
            "uri": "spotify:album:2OyVtIEp7O7a6o82DF4Ba5",
            "artists": [
              {
                "name": "Journey",
                "link": "https://api.spotify.com/v1/artists/0rvjqX7ttXeg3mTy8Xscbt"
              }
            ],
            "year": 1980,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b2737e8045e318486885fe243817"
          },
          "duration_ms": 201693
        },
        {
          "name": "Don't Stop Believin' (2022 Remaster)",
          "link": "https://api.spotify.com/v1/tracks/5RKQ5NdjSh2QzD4MaunT91",
          "uri": "spotify:track:5RKQ5NdjSh2QzD4MaunT91",
          "artists": [
            {
              "name": "Journey",
              "link": "https://api.spotify.com/v1/artists/0rvjqX7ttXeg3mTy8Xscbt"
            }
          ],
          "album": {
            "name": "Escape (2022 Remaster)",
            "link": "https://api.spotify.com/v1/albums/4guAwaniEAEQSW0NCpo4gm",
            "uri": "spotify:album:4guAwaniEAEQSW0NCpo4gm",
            "artists": [
              {
                "name": "Journey",
                "link": "https://api.spotify.com/v1/artists/0rvjqX7ttXeg3mTy8Xscbt"
              }
            ],
            "year": 1981,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b27363fa4751355b66f236943275"
          },
          "duration_ms": 249600
        },
        {
          "name": "Joutsenlaulu",
          "link": "https://api.spotify.com/v1/tracks/0Ge2sv01I9HgpZwdETWaXs",
          "uri": "spotify:track:0Ge2sv01I9HgpZwdETWaXs",
          "artists": [
            {
              "name": "For My Pain...",
              "link": "https://api.spotify.com/v1/artists/6s5biOReFi1Oe9GQOG0nsL"
            }
          ],
          "album": {
            "name": "Fallen (2009 Edition)",
            "link": "https://api.spotify.com/v1/albums/18xBwk08HJiVEw2Jm0nYAp",
            "uri": "spotify:album:18xBwk08HJiVEw2Jm0nYAp",
            "artists": [
              {
                "name": "For My Pain...",
                "link": "https://api.spotify.com/v1/artists/6s5biOReFi1Oe9GQOG0nsL"
              }
            ],
            "year": 2003,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b273edbaba5616a52603b52f35ac"
          },
          "duration_ms": 337866
        },
        {
          "name": "Joutilas",
          "link": "https://api.spotify.com/v1/tracks/0gUfzBfy4nstEI6DE14hjK",
          "uri": "spotify:track:0gUfzBfy4nstEI6DE14hjK",
          "artists": [
            {
              "name": "YUP",
              "link": "https://api.spotify.com/v1/artists/6Wx7K9nF7B5pq7oI2Ow3k7"
            }
          ],
          "album": {
            "name": "Leppymättömät",
            "link": "https://api.spotify.com/v1/albums/6aV4w13JfnvHTrkOlAGEh3",
            "uri": "spotify:album:6aV4w13JfnvHTrkOlAGEh3",
            "artists": [
              {
                "name": "YUP",
                "link": "https://api.spotify.com/v1/artists/6Wx7K9nF7B5pq7oI2Ow3k7"
              }
            ],
            "year": 2003,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b2736cbf38284d4f6e5f35476f74"
          },
          "duration_ms": 189626
        },
        {
          "name": "Don't Stop Believin' (2024 Remaster)",
          "link": "https://api.spotify.com/v1/tracks/5ehcf6UL1TkwozB386cRAp",
          "uri": "spotify:track:5ehcf6UL1TkwozB386cRAp",
          "artists": [
            {
              "name": "Journey",
              "link": "https://api.spotify.com/v1/artists/0rvjqX7ttXeg3mTy8Xscbt"
            }
          ],
          "album": {
            "name": "Greatest Hits (2024 Remaster)",
            "link": "https://api.spotify.com/v1/albums/1Gtf2hZQlOGVER16uemmzR",
            "uri": "spotify:album:1Gtf2hZQlOGVER16uemmzR",
            "artists": [
              {
                "name": "Journey",
                "link": "https://api.spotify.com/v1/artists/0rvjqX7ttXeg3mTy8Xscbt"
              }
            ],
            "year": 1988,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b2733fa684e0f8fad563122ff6dc"
          },
          "duration_ms": 250835
        },
        {
          "name": "Joulun kanssas jaan (feat. Cantores Minores)",
          "link": "https://api.spotify.com/v1/tracks/3RCxl6HWK4ADOzMbY8FZCw",
          "uri": "spotify:track:3RCxl6HWK4ADOzMbY8FZCw",
          "artists": [
            {
              "name": "Haloo Helsinki!",
              "link": "https://api.spotify.com/v1/artists/0JTMRuiDzOCjWuYtWMgv2s"
            },
            {
              "name": "Cantores Minores",
              "link": "https://api.spotify.com/v1/artists/6ibKc7zCn0f7pIVEXvhIJB"
            }
          ],
          "album": {
            "name": "Joulun kanssas jaan (feat. Cantores Minores)",
            "link": "https://api.spotify.com/v1/albums/4hUrMPSpOYKLtDqdi8zlOS",
            "uri": "spotify:album:4hUrMPSpOYKLtDqdi8zlOS",
            "artists": [
              {
                "name": "Haloo Helsinki!",
                "link": "https://api.spotify.com/v1/artists/0JTMRuiDzOCjWuYtWMgv2s"
              }
            ],
            "year": 2017,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b273e5a2e54b623f84844d927560"
          },
          "duration_ms": 278786
        },
        {
          "name": "Joulumaa",
          "link": "https://api.spotify.com/v1/tracks/3QqsEc7mv1Kq9aWNpQgHsU",
          "uri": "spotify:track:3QqsEc7mv1Kq9aWNpQgHsU",
          "artists": [
            {
              "name": "Katri Helena",
              "link": "https://api.spotify.com/v1/artists/2IfvzNKtnV8PTAh7H6ZVfv"
            }
          ],
          "album": {
            "name": "Hiljaisuudessa 2006",
            "link": "https://api.spotify.com/v1/albums/48xHPaOdIKHS8mAas29K5O",
            "uri": "spotify:album:48xHPaOdIKHS8mAas29K5O",
            "artists": [
              {
                "name": "Katri Helena",
                "link": "https://api.spotify.com/v1/artists/2IfvzNKtnV8PTAh7H6ZVfv"
              }
            ],
            "year": 2006,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b27336330b463e2ab02d51ea8114"
          },
          "duration_ms": 206959
        },
        {
          "name": "Joutomaa",
          "link": "https://api.spotify.com/v1/tracks/12KuGnUiNLCzGJWCYFdtjv",
          "uri": "spotify:track:12KuGnUiNLCzGJWCYFdtjv",
          "artists": [
            {
              "name": "Rosi",
              "link": "https://api.spotify.com/v1/artists/5UBkH6rCwJph8r38ZKQug6"
            }
          ],
          "album": {
            "name": "Joutomaa",
            "link": "https://api.spotify.com/v1/albums/0vC7I50vs9oevoKjSP9Wcc",
            "uri": "spotify:album:0vC7I50vs9oevoKjSP9Wcc",
            "artists": [
              {
                "name": "Rosi",
                "link": "https://api.spotify.com/v1/artists/5UBkH6rCwJph8r38ZKQug6"
              }
            ],
            "year": 2024,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b273016ad7de98eefffd6b3c6ce8"
          },
          "duration_ms": 180120
        },
        {
          "name": "Joukkotuhoase",
          "link": "https://api.spotify.com/v1/tracks/7dkWxGPTscgjzg6JwfXy55",
          "uri": "spotify:track:7dkWxGPTscgjzg6JwfXy55",
          "artists": [
            {
              "name": "Mokoma",
              "link": "https://api.spotify.com/v1/artists/2LBteY4vnSD2zKwAgzOijB"
            }
          ],
          "album": {
            "name": "Myrsky",
            "link": "https://api.spotify.com/v1/albums/7HRrljwjEWlAAeeO0AIHw1",
            "uri": "spotify:album:7HRrljwjEWlAAeeO0AIHw1",
            "artists": [
              {
                "name": "Mokoma",
                "link": "https://api.spotify.com/v1/artists/2LBteY4vnSD2zKwAgzOijB"
              }
            ],
            "year": 2024,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b2734f8ffc59412dc71c72d40c94"
          },
          "duration_ms": 201508
        },
        {
          "name": "Open Arms (2022 Remaster)",
          "link": "https://api.spotify.com/v1/tracks/29vqBtjJTBLS1f8dKJS4Ht",
          "uri": "spotify:track:29vqBtjJTBLS1f8dKJS4Ht",
          "artists": [
            {
              "name": "Journey",
              "link": "https://api.spotify.com/v1/artists/0rvjqX7ttXeg3mTy8Xscbt"
            }
          ],
          "album": {
            "name": "Escape (2022 Remaster)",
            "link": "https://api.spotify.com/v1/albums/4guAwaniEAEQSW0NCpo4gm",
            "uri": "spotify:album:4guAwaniEAEQSW0NCpo4gm",
            "artists": [
              {
                "name": "Journey",
                "link": "https://api.spotify.com/v1/artists/0rvjqX7ttXeg3mTy8Xscbt"
              }
            ],
            "year": 1981,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b27363fa4751355b66f236943275"
          },
          "duration_ms": 199320
        },
        {
          "name": "Joululaulu",
          "link": "https://api.spotify.com/v1/tracks/18Ra4rWQdsL8ViBBj3sNas",
          "uri": "spotify:track:18Ra4rWQdsL8ViBBj3sNas",
          "artists": [
            {
              "name": "emma & matilda",
              "link": "https://api.spotify.com/v1/artists/2jBUgp0vh5pEIqeTLpWCgV"
            }
          ],
          "album": {
            "name": "Joululaulu",
            "link": "https://api.spotify.com/v1/albums/7w6ZlRSBRQlQPkrFjUlCmX",
            "uri": "spotify:album:7w6ZlRSBRQlQPkrFjUlCmX",
            "artists": [
              {
                "name": "emma & matilda",
                "link": "https://api.spotify.com/v1/artists/2jBUgp0vh5pEIqeTLpWCgV"
              }
            ],
            "year": 2023,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b2730fdc4e83223ba323c422f54d"
          },
          "duration_ms": 156189
        },
        {
          "name": "Faithfully (2023 Remaster)",
          "link": "https://api.spotify.com/v1/tracks/0l5TpsCL1ObiTEsHeWA0by",
          "uri": "spotify:track:0l5TpsCL1ObiTEsHeWA0by",
          "artists": [
            {
              "name": "Journey",
              "link": "https://api.spotify.com/v1/artists/0rvjqX7ttXeg3mTy8Xscbt"
            }
          ],
          "album": {
            "name": "Frontiers (2023 Remaster)",
            "link": "https://api.spotify.com/v1/albums/3pZ6D15onAaT2YyiTbcHmh",
            "uri": "spotify:album:3pZ6D15onAaT2YyiTbcHmh",
            "artists": [
              {
                "name": "Journey",
                "link": "https://api.spotify.com/v1/artists/0rvjqX7ttXeg3mTy8Xscbt"
              }
            ],
            "year": 1983,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b2735faa719b168dfd8c46f7aaeb"
          },
          "duration_ms": 266946
        },
        {
          "name": "Only the Young (2024 Remaster)",
          "link": "https://api.spotify.com/v1/tracks/6S89Xbg2YPxmS5VfDBlZVt",
          "uri": "spotify:track:6S89Xbg2YPxmS5VfDBlZVt",
          "artists": [
            {
              "name": "Journey",
              "link": "https://api.spotify.com/v1/artists/0rvjqX7ttXeg3mTy8Xscbt"
            }
          ],
          "album": {
            "name": "Greatest Hits (2024 Remaster)",
            "link": "https://api.spotify.com/v1/albums/1Gtf2hZQlOGVER16uemmzR",
            "uri": "spotify:album:1Gtf2hZQlOGVER16uemmzR",
            "artists": [
              {
                "name": "Journey",
                "link": "https://api.spotify.com/v1/artists/0rvjqX7ttXeg3mTy8Xscbt"
              }
            ],
            "year": 1988,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b2733fa684e0f8fad563122ff6dc"
          },
          "duration_ms": 244493
        },
        {
          "name": "Joutsenmerkkijäbä",
          "link": "https://api.spotify.com/v1/tracks/0N7Ciw8XnA3w2PBF5ZWMk7",
          "uri": "spotify:track:0N7Ciw8XnA3w2PBF5ZWMk7",
          "artists": [
            {
              "name": "Tohtori Getto",
              "link": "https://api.spotify.com/v1/artists/2B97faqsVrAF7KGnS21TlY"
            }
          ],
          "album": {
            "name": "Koiramies / Joutsenmerkkijäbä",
            "link": "https://api.spotify.com/v1/albums/71W57yMujwmlklPq5rPDv7",
            "uri": "spotify:album:71W57yMujwmlklPq5rPDv7",
            "artists": [
              {
                "name": "Tohtori Getto",
                "link": "https://api.spotify.com/v1/artists/2B97faqsVrAF7KGnS21TlY"
              }
            ],
            "year": 2021,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b27393574f7128a7b30b86a8e726"
          },
          "duration_ms": 212506
        },
        {
          "name": "Journey",
          "link": "https://api.spotify.com/v1/tracks/0UkUvEADdjRQe7obElGPn0",
          "uri": "spotify:track:0UkUvEADdjRQe7obElGPn0",
          "artists": [
            {
              "name": "DARUMA DARUMA",
              "link": "https://api.spotify.com/v1/artists/274Z1t9Zb00hKRAwcO0IKd"
            }
          ],
          "album": {
            "name": "Journey",
            "link": "https://api.spotify.com/v1/albums/4dM8AJmBXsntroIwWaqNlg",
            "uri": "spotify:album:4dM8AJmBXsntroIwWaqNlg",
            "artists": [
              {
                "name": "DARUMA DARUMA",
                "link": "https://api.spotify.com/v1/artists/274Z1t9Zb00hKRAwcO0IKd"
              }
            ],
            "year": 2024,
            "icon_link": "https://i.scdn.co/image/ab67616d0000b2732e3398f44071ebf25724f905"
          },
          "duration_ms": 158000
        }
      ]
    },
    "albums": {
      "limit": 20,
      "offset": 0,
      "total": 204,
      "self_page_link": "https://api.spotify.com/v1/search?query=JOu&type=album&offset=0&limit=20",
      "next_page_link": "https://api.spotify.com/v1/search?query=JOu&type=album&offset=20&limit=20",
      "results": [
        {
          "name": "Greatest Hits (2024 Remaster)",
          "link": "https://api.spotify.com/v1/albums/1Gtf2hZQlOGVER16uemmzR",
          "uri": "spotify:album:1Gtf2hZQlOGVER16uemmzR",
          "artists": [
            {
              "name": "Journey",
              "link": "https://api.spotify.com/v1/artists/0rvjqX7ttXeg3mTy8Xscbt"
            }
          ],
          "year": 1988,
          "icon_link": "https://i.scdn.co/image/ab67616d0000b2733fa684e0f8fad563122ff6dc"
        },
        {
          "name": "Freedom",
          "link": "https://api.spotify.com/v1/albums/6EBjdKsgkosFJK5tB5YFLu",
          "uri": "spotify:album:6EBjdKsgkosFJK5tB5YFLu",
          "artists": [
            {
              "name": "Journey",
              "link": "https://api.spotify.com/v1/artists/0rvjqX7ttXeg3mTy8Xscbt"
            }
          ],
          "year": 2022,
          "icon_link": "https://i.scdn.co/image/ab67616d0000b2732b2422c254479aa511e5e15e"
        },
        {
          "name": "Joutomaa",
          "link": "https://api.spotify.com/v1/albums/0vC7I50vs9oevoKjSP9Wcc",
          "uri": "spotify:album:0vC7I50vs9oevoKjSP9Wcc",
          "artists": [
            {
              "name": "Rosi",
              "link": "https://api.spotify.com/v1/artists/5UBkH6rCwJph8r38ZKQug6"
            }
          ],
          "year": 2024,
          "icon_link": "https://i.scdn.co/image/ab67616d0000b273016ad7de98eefffd6b3c6ce8"
        },
        {
          "name": "Antaa Soittaa",
          "link": "https://api.spotify.com/v1/albums/0PacYVm4HjNw2FZCJofIHl",
          "uri": "spotify:album:0PacYVm4HjNw2FZCJofIHl",
          "artists": [
            {
              "name": "Yö",
              "link": "https://api.spotify.com/v1/artists/3m0tK2ilcQE0NkGlbxJ56q"
            }
          ],
          "year": 1991,
          "icon_link": "https://i.scdn.co/image/ab67616d0000b273e939578377fed26e73686b2e"
        },
        {
          "name": "Joulun kanssas jaan (feat. Cantores Minores)",
          "link": "https://api.spotify.com/v1/albums/4hUrMPSpOYKLtDqdi8zlOS",
          "uri": "spotify:album:4hUrMPSpOYKLtDqdi8zlOS",
          "artists": [
            {
              "name": "Haloo Helsinki!",
              "link": "https://api.spotify.com/v1/artists/0JTMRuiDzOCjWuYtWMgv2s"
            }
          ],
          "year": 2017,
          "icon_link": "https://i.scdn.co/image/ab67616d0000b273e5a2e54b623f84844d927560"
        },
        {
          "name": "Infinity",
          "link": "https://api.spotify.com/v1/albums/7K4Nk5fHkCuzNm5A6mdo2U",
          "uri": "spotify:album:7K4Nk5fHkCuzNm5A6mdo2U",
          "artists": [
            {
              "name": "Journey",
              "link": "https://api.spotify.com/v1/artists/0rvjqX7ttXeg3mTy8Xscbt"
            }
          ],
          "year": 1978,
          "icon_link": "https://i.scdn.co/image/ab67616d0000b2731b2a9188ac775e16998eb78d"
        },
        {
          "name": "Frontiers (2023 Remaster)",
          "link": "https://api.spotify.com/v1/albums/3pZ6D15onAaT2YyiTbcHmh",
          "uri": "spotify:album:3pZ6D15onAaT2YyiTbcHmh",
          "artists": [
            {
              "name": "Journey",
              "link": "https://api.spotify.com/v1/artists/0rvjqX7ttXeg3mTy8Xscbt"
            }
          ],
          "year": 1983,
          "icon_link": "https://i.scdn.co/image/ab67616d0000b2735faa719b168dfd8c46f7aaeb"
        },
        {
          "name": "Departure",
          "link": "https://api.spotify.com/v1/albums/2OyVtIEp7O7a6o82DF4Ba5",
          "uri": "spotify:album:2OyVtIEp7O7a6o82DF4Ba5",
          "artists": [
            {
              "name": "Journey",
              "link": "https://api.spotify.com/v1/artists/0rvjqX7ttXeg3mTy8Xscbt"
            }
          ],
          "year": 1980,
          "icon_link": "https://i.scdn.co/image/ab67616d0000b2737e8045e318486885fe243817"
        },
        {
          "name": "Escape (2022 Remaster)",
          "link": "https://api.spotify.com/v1/albums/4guAwaniEAEQSW0NCpo4gm",
          "uri": "spotify:album:4guAwaniEAEQSW0NCpo4gm",
          "artists": [
            {
              "name": "Journey",
              "link": "https://api.spotify.com/v1/artists/0rvjqX7ttXeg3mTy8Xscbt"
            }
          ],
          "year": 1981,
          "icon_link": "https://i.scdn.co/image/ab67616d0000b27363fa4751355b66f236943275"
        },
        {
          "name": "Jouko ja Kosti",
          "link": "https://api.spotify.com/v1/albums/0jXDaColysubES4j9xvtkT",
          "uri": "spotify:album:0jXDaColysubES4j9xvtkT",
          "artists": [
            {
              "name": "Jouko ja Kosti",
              "link": "https://api.spotify.com/v1/artists/4HEgzAvL08u9Qqw5CF5r3K"
            }
          ],
          "year": 1971,
          "icon_link": "https://i.scdn.co/image/ab67616d0000b2732e23602d0687be9cf6b46983"
        },
        {
          "name": "Un jour à la fois",
          "link": "https://api.spotify.com/v1/albums/7r86FyhIHlnAw12hNJUERx",
          "uri": "spotify:album:7r86FyhIHlnAw12hNJUERx",
          "artists": [
            {
              "name": "Claude G Huard",
              "link": "https://api.spotify.com/v1/artists/5UVNjmZ4syLwqjfbjHm6Ks"
            }
          ],
          "year": 2024,
          "icon_link": "https://i.scdn.co/image/ab67616d0000b273a83ea16cd152e71e800276f9"
        },
        {
          "name": "Journey",
          "link": "https://api.spotify.com/v1/albums/4dM8AJmBXsntroIwWaqNlg",
          "uri": "spotify:album:4dM8AJmBXsntroIwWaqNlg",
          "artists": [
            {
              "name": "DARUMA DARUMA",
              "link": "https://api.spotify.com/v1/artists/274Z1t9Zb00hKRAwcO0IKd"
            }
          ],
          "year": 2024,
          "icon_link": "https://i.scdn.co/image/ab67616d0000b2732e3398f44071ebf25724f905"
        },
        {
          "name": "Joulun henki",
          "link": "https://api.spotify.com/v1/albums/4GxkzDHzHRaafmLuy1TNij",
          "uri": "spotify:album:4GxkzDHzHRaafmLuy1TNij",
          "artists": [
            {
              "name": "Suvi Teräsniska",
              "link": "https://api.spotify.com/v1/artists/76BCq0XM9wlppqHy4pXmoS"
            }
          ],
          "year": 2014,
          "icon_link": "https://i.scdn.co/image/ab67616d0000b273e845ccc8b18f001893f96a11"
        },
        {
          "name": "Journals",
          "link": "https://api.spotify.com/v1/albums/1rknZw4cyL9NInAqSwc8AA",
          "uri": "spotify:album:1rknZw4cyL9NInAqSwc8AA",
          "artists": [
            {
              "name": "Justin Bieber",
              "link": "https://api.spotify.com/v1/artists/1uNFoZAHBGtllmzznpCI3s"
            }
          ],
          "year": 2014,
          "icon_link": "https://i.scdn.co/image/ab67616d0000b27358ae8fddecbd2630005409c9"
        },
        {
          "name": "Joulu joutuu",
          "link": "https://api.spotify.com/v1/albums/24DxVgkwFifp9oJjZP5oeL",
          "uri": "spotify:album:24DxVgkwFifp9oJjZP5oeL",
          "artists": [
            {
              "name": "Fröbelin Palikat",
              "link": "https://api.spotify.com/v1/artists/15GjKMmUls0IUK5Gz3KEF8"
            }
          ],
          "year": 2016,
          "icon_link": "https://i.scdn.co/image/ab67616d0000b273ea4a5e4408cc427634efe62d"
        },
        {
          "name": "Gentle Journeys",
          "link": "https://api.spotify.com/v1/albums/6D5tdiRRVR7DHcWcZJTa2e",
          "uri": "spotify:album:6D5tdiRRVR7DHcWcZJTa2e",
          "artists": [
            {
              "name": "Old Inherited Piano",
              "link": "https://api.spotify.com/v1/artists/1rQ87wlgwARS4gWZyXI78S"
            }
          ],
          "year": 2024,
          "icon_link": "https://i.scdn.co/image/ab67616d0000b273f5813f25a2232f5dff9f73db"
        },
        {
          "name": "Gentle Journeys Music",
          "link": "https://api.spotify.com/v1/albums/5LSc8l6oIMDX0G8ydqaui3",
          "uri": "spotify:album:5LSc8l6oIMDX0G8ydqaui3",
          "artists": [
            {
              "name": "The Unexplainable Store",
              "link": "https://api.spotify.com/v1/artists/1cb1vKZZpzhHFE6JTTYkKT"
            }
          ],
          "year": 2024,
          "icon_link": "https://i.scdn.co/image/ab67616d0000b273a890fc2330f23e391e01caaf"
        },
        {
          "name": "Gentle Piano Journeys",
          "link": "https://api.spotify.com/v1/albums/4eJB8o2bbQwEfwd4VehqPk",
          "uri": "spotify:album:4eJB8o2bbQwEfwd4VehqPk",
          "artists": [
            {
              "name": "Acoustic Classics",
              "link": "https://api.spotify.com/v1/artists/0fv5HinEYKDxV2pA50a9HA"
            }
          ],
          "year": 2024,
          "icon_link": "https://i.scdn.co/image/ab67616d0000b273102dc04ac32319bed7d8a8c5"
        },
        {
          "name": "Gentle Journeys Time",
          "link": "https://api.spotify.com/v1/albums/6T69IPP6LhGxbxh7dlE6Nx",
          "uri": "spotify:album:6T69IPP6LhGxbxh7dlE6Nx",
          "artists": [
            {
              "name": "Background White Noise",
              "link": "https://api.spotify.com/v1/artists/7nixcnKd43u9a29ZMawfnh"
            }
          ],
          "year": 2024,
          "icon_link": "https://i.scdn.co/image/ab67616d0000b273f8bebe090247f019a9727cd3"
        },
        {
          "name": "Gentle Journeys",
          "link": "https://api.spotify.com/v1/albums/6F60nzPt1A1e65jPvKl2zn",
          "uri": "spotify:album:6F60nzPt1A1e65jPvKl2zn",
          "artists": [
            {
              "name": "Wave Sound Group",
              "link": "https://api.spotify.com/v1/artists/5DO3Isgj0gLAExTaVzbfMB"
            }
          ],
          "year": 2024,
          "icon_link": "https://i.scdn.co/image/ab67616d0000b27333a7946e6d41da5226d86611"
        }
      ]
    },
    "artists": {
      "limit": 20,
      "offset": 0,
      "total": 55,
      "self_page_link": "https://api.spotify.com/v1/search?query=JOu&type=artist&offset=0&limit=20",
      "next_page_link": "https://api.spotify.com/v1/search?query=JOu&type=artist&offset=20&limit=20",
      "results": [
        {
          "name": "Journey",
          "link": "https://api.spotify.com/v1/artists/0rvjqX7ttXeg3mTy8Xscbt",
          "uri": "spotify:artist:0rvjqX7ttXeg3mTy8Xscbt",
          "icon_link": "https://i.scdn.co/image/ab6761610000e5ebe848dfb35ea4969099662dfd"
        },
        {
          "name": "Kansas",
          "link": "https://api.spotify.com/v1/artists/2hl0xAkS2AIRAu23TVMBG1",
          "uri": "spotify:artist:2hl0xAkS2AIRAu23TVMBG1",
          "icon_link": "https://i.scdn.co/image/ab6761610000e5ebce30906f8428166de2e7b592"
        },
        {
          "name": "Foreigner",
          "link": "https://api.spotify.com/v1/artists/6IRouO5mvvfcyxtPDKMYFN",
          "uri": "spotify:artist:6IRouO5mvvfcyxtPDKMYFN",
          "icon_link": "https://i.scdn.co/image/ab6761610000e5ebb338d6964565206f741d5ad1"
        },
        {
          "name": "Boston",
          "link": "https://api.spotify.com/v1/artists/29kkCKKGXheHuoO829FxWK",
          "uri": "spotify:artist:29kkCKKGXheHuoO829FxWK",
          "icon_link": "https://i.scdn.co/image/051ffa17a5832586c6e0f8ee8a705ad15114e9c0"
        },
        {
          "name": "Jouko Mäki-Lohiluoma",
          "link": "https://api.spotify.com/v1/artists/2NxoPESl7U2fsHcwx1dOYu",
          "uri": "spotify:artist:2NxoPESl7U2fsHcwx1dOYu",
          "icon_link": "https://i.scdn.co/image/ab67616d0000b273a57cee1af196c6542493d97e"
        },
        {
          "name": "TOTO",
          "link": "https://api.spotify.com/v1/artists/0PFtn5NtBbbUNbU9EAmIWF",
          "uri": "spotify:artist:0PFtn5NtBbbUNbU9EAmIWF",
          "icon_link": "https://i.scdn.co/image/ab6761610000e5eba59a5bcab211f964fe9bfb06"
        },
        {
          "name": "Joy Division",
          "link": "https://api.spotify.com/v1/artists/432R46LaYsJZV2Gmc4jUV5",
          "uri": "spotify:artist:432R46LaYsJZV2Gmc4jUV5",
          "icon_link": "https://i.scdn.co/image/5eeddd733170399db794d2c430a8d2cde7ae1425"
        },
        {
          "name": "Yö",
          "link": "https://api.spotify.com/v1/artists/3m0tK2ilcQE0NkGlbxJ56q",
          "uri": "spotify:artist:3m0tK2ilcQE0NkGlbxJ56q",
          "icon_link": "https://i.scdn.co/image/e17054a13140edd76f3ea1e8a374bc96209015ed"
        },
        {
          "name": "Heart",
          "link": "https://api.spotify.com/v1/artists/34jw2BbxjoYalTp8cJFCPv",
          "uri": "spotify:artist:34jw2BbxjoYalTp8cJFCPv",
          "icon_link": "https://i.scdn.co/image/1c145626e516a6817c43e7eab2b1cc3a5a9562a8"
        },
        {
          "name": "Survivor",
          "link": "https://api.spotify.com/v1/artists/26bcq2nyj5GB7uRr558iQg",
          "uri": "spotify:artist:26bcq2nyj5GB7uRr558iQg",
          "icon_link": "https://i.scdn.co/image/da30acd2c9d0f32f5f5a2d69f32c2d30335466b5"
        },
        {
          "name": "Jouko ja Kosti",
          "link": "https://api.spotify.com/v1/artists/4HEgzAvL08u9Qqw5CF5r3K",
          "uri": "spotify:artist:4HEgzAvL08u9Qqw5CF5r3K",
          "icon_link": "https://i.scdn.co/image/ab67616d0000b2732e23602d0687be9cf6b46983"
        },
        {
          "name": "Jouni J",
          "link": "https://api.spotify.com/v1/artists/0fyWVB5NsddaTf4LzhQzAL",
          "uri": "spotify:artist:0fyWVB5NsddaTf4LzhQzAL",
          "icon_link": "https://i.scdn.co/image/ab67616d0000b273fafd4dfaacc445a6827c177e"
        },
        {
          "name": "Joululauluja ja Joululaulut",
          "link": "https://api.spotify.com/v1/artists/4HSUL5I5znUbPRm1QcAz8W",
          "uri": "spotify:artist:4HSUL5I5znUbPRm1QcAz8W",
          "icon_link": "https://i.scdn.co/image/ab67616d0000b273378aeddfd0460386c6cdfc7f"
        },
        {
          "name": "Jouni Hynynen",
          "link": "https://api.spotify.com/v1/artists/7vHL43OsRz4c28Pr0KceuP",
          "uri": "spotify:artist:7vHL43OsRz4c28Pr0KceuP",
          "icon_link": "https://i.scdn.co/image/ab67616d0000b27315b6cb4df53fb1c5b86f26d0"
        },
        {
          "name": "Jouni Somero",
          "link": "https://api.spotify.com/v1/artists/5JlGrd9qnFcht9MNyY5q7a",
          "uri": "spotify:artist:5JlGrd9qnFcht9MNyY5q7a",
          "icon_link": "https://i.scdn.co/image/ab6761610000e5ebf7a607ba5eda2f9f4c3318e8"
        },
        {
          "name": "Joulupukki",
          "link": "https://api.spotify.com/v1/artists/3h3lzNQ9wpFc5bL0iMTzEi",
          "uri": "spotify:artist:3h3lzNQ9wpFc5bL0iMTzEi",
          "icon_link": "https://i.scdn.co/image/ab67616d0000b273bd829336defb98d80dc3daa4"
        },
        {
          "name": "Jussi Hakulinen & likaiset legendat",
          "link": "https://api.spotify.com/v1/artists/3dyejgdai0xXOAgh6tUfeq",
          "uri": "spotify:artist:3dyejgdai0xXOAgh6tUfeq",
          "icon_link": "https://i.scdn.co/image/ab67616d0000b27371638ad0a15c939070a0a509"
        },
        {
          "name": "Jouko Tekoniemi",
          "link": "https://api.spotify.com/v1/artists/4WpRshyCtUEmvvHzGAe65n",
          "uri": "spotify:artist:4WpRshyCtUEmvvHzGAe65n",
          "icon_link": null
        },
        {
          "name": "Jouni Pietiläinen",
          "link": "https://api.spotify.com/v1/artists/2m9jzdi5iT20mLYXzXDFwv",
          "uri": "spotify:artist:2m9jzdi5iT20mLYXzXDFwv",
          "icon_link": null
        },
        {
          "name": "Jouko Lindfors",
          "link": "https://api.spotify.com/v1/artists/0dAjTWx8vGSIXQDobNyvfy",
          "uri": "spotify:artist:0dAjTWx8vGSIXQDobNyvfy",
          "icon_link": null
        }
      ]
    },
    "playlists": {
      "limit": 20,
      "offset": 0,
      "total": 40,
      "self_page_link": "https://api.spotify.com/v1/search?query=JOu&type=playlist&offset=0&limit=20",
      "next_page_link": "https://api.spotify.com/v1/search?query=JOu&type=playlist&offset=20&limit=20",
      "results": [
        {
          "name": "Your Top Songs 2019",
          "link": "https://api.spotify.com/v1/playlists/37i9dQZF1Etddpy5KuGLgP",
          "uri": "spotify:playlist:37i9dQZF1Etddpy5KuGLgP",
          "icon_link": "https://lineup-images.scdn.co/your-top-songs-2019_LARGE-en.jpg"
        },
        {
          "name": "joukkuevoimistelu musiikit",
          "link": "https://api.spotify.com/v1/playlists/49Mm39ZjCMCeW11EGbJPwl",
          "uri": "spotify:playlist:49Mm39ZjCMCeW11EGbJPwl",
          "icon_link": "https://mosaic.scdn.co/640/ab67616d0000b273103a8fd17ff6b4de98b84aa4ab67616d0000b2732e3049fef96abebf336b7366ab67616d0000b2733ec89be0ff008569bf0cf3e4ab67616d0000b273f9ef39657ba18c612641ee6d"
        },
        {
          "name": "This Is Journey",
          "link": "https://api.spotify.com/v1/playlists/37i9dQZF1DZ06evO0c4xR6",
          "uri": "spotify:playlist:37i9dQZF1DZ06evO0c4xR6",
          "icon_link": "https://thisis-images.spotifycdn.com/37i9dQZF1DZ06evO0c4xR6-large.jpg"
        },
        {
          "name": "Journey Radio",
          "link": "https://api.spotify.com/v1/playlists/4Oa8UqoWkKEZN6W05LVN8I",
          "uri": "spotify:playlist:4Oa8UqoWkKEZN6W05LVN8I",
          "icon_link": "https://mosaic.scdn.co/640/ab67616d0000b27363fa4751355b66f236943275ab67616d0000b273813da91820fd194cbee5bdceab67616d0000b273bbf0146981704a073405b6c2ab67616d0000b273f903e62767a0e22e33b7af83"
        },
        {
          "name": "Toto & Journey 2024 Setlist",
          "link": "https://api.spotify.com/v1/playlists/1lnSkxAmGjPE3Aw45gYM4N",
          "uri": "spotify:playlist:1lnSkxAmGjPE3Aw45gYM4N",
          "icon_link": "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000bebb29685014e70561dce166b6d1"
        },
        {
          "name": "Journey's Greatest Hits",
          "link": "https://api.spotify.com/v1/playlists/3spoJ7tXwk6tLV6ABEkUG4",
          "uri": "spotify:playlist:3spoJ7tXwk6tLV6ABEkUG4",
          "icon_link": "https://mosaic.scdn.co/640/ab67616d0000b2734ab8afe09938db970db1893cab67616d0000b2735cf430d56b75201a80d30e7fab67616d0000b273759e06b18b3f535278a2de0eab67616d0000b273e9afc30c11de1468fe201970"
        },
        {
          "name": "Your Top Songs 2017",
          "link": "https://api.spotify.com/v1/playlists/37i9dQZF1E9TgwVSPCCcdr",
          "uri": "spotify:playlist:37i9dQZF1E9TgwVSPCCcdr",
          "icon_link": "https://lineup-images.scdn.co/your-top-songs-2017_LARGE-en.jpg"
        },
        {
          "name": "Yö — Joutsenlaulu - with Yö",
          "link": "https://api.spotify.com/v1/playlists/0wmo8TWLwh5MXAovYfwwOD",
          "uri": "spotify:playlist:0wmo8TWLwh5MXAovYfwwOD",
          "icon_link": "https://mosaic.scdn.co/640/ab67616d0000b27352a0303f6a9d555e7fd1f785ab67616d0000b27353de8ad68552af5221c4cb85ab67616d0000b2736e8eea525d4ec48161ce034bab67616d0000b27387f31fa002b6662c74d603cd"
        },
        {
          "name": "Journey - As Melhores",
          "link": "https://api.spotify.com/v1/playlists/3FaVgRfEeCcImCkZC1Etfw",
          "uri": "spotify:playlist:3FaVgRfEeCcImCkZC1Etfw",
          "icon_link": "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000bebb93a8e38022cd3c53dbcd029f"
        },
        {
          "name": "nuo hetket syntymästä kuolemaan",
          "link": "https://api.spotify.com/v1/playlists/31H8KF4ICdun12U2lqe1Nf",
          "uri": "spotify:playlist:31H8KF4ICdun12U2lqe1Nf",
          "icon_link": "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000bebbd301b0c78060fc1714ad0894"
        },
        {
          "name": "Joutsenlaulu – Jussi Hakulinen",
          "link": "https://api.spotify.com/v1/playlists/1mLEYwXola5JS3T987oZ3b",
          "uri": "spotify:playlist:1mLEYwXola5JS3T987oZ3b",
          "icon_link": "https://mosaic.scdn.co/640/ab67616d0000b273a9217fe9396c0dcced12efd3ab67616d0000b273b1e8ce638351788e74cf4316ab67616d0000b273c484bdd0e74b9a449f48ddcaab67616d0000b273d97b1e920735b767e53d8ae5"
        },
        {
          "name": "Journey Radio",
          "link": "https://api.spotify.com/v1/playlists/37i9dQZF1E4yMQpHLTye4c",
          "uri": "spotify:playlist:37i9dQZF1E4yMQpHLTye4c",
          "icon_link": "https://seeded-session-images.scdn.co/v2/img/122/secondary/artist/0rvjqX7ttXeg3mTy8Xscbt/en"
        },
        {
          "name": "Your Summer Rewind",
          "link": "https://api.spotify.com/v1/playlists/37i9dQZF1CAggwEYe3oA3j",
          "uri": "spotify:playlist:37i9dQZF1CAggwEYe3oA3j",
          "icon_link": "https://lineup-images.scdn.co/summer-rewind-2020_LARGE-en.jpg"
        },
        {
          "name": "Your Top Songs 2018",
          "link": "https://api.spotify.com/v1/playlists/37i9dQZF1Ejs0rbMaJER6G",
          "uri": "spotify:playlist:37i9dQZF1Ejs0rbMaJER6G",
          "icon_link": "https://lineup-images.scdn.co/your-top-songs-2018_LARGE-en.jpg"
        },
        {
          "name": "Your Top Songs 2020",
          "link": "https://api.spotify.com/v1/playlists/37i9dQZF1ELYJfyTepmAJy",
          "uri": "spotify:playlist:37i9dQZF1ELYJfyTepmAJy",
          "icon_link": "https://lineup-images.scdn.co/wrapped-2020-top100_LARGE-en.jpg"
        },
        {
          "name": "Jussi Hakulinen — Joutsenlaulu - with Yö",
          "link": "https://api.spotify.com/v1/playlists/48lifGtufT4JW11587NAr3",
          "uri": "spotify:playlist:48lifGtufT4JW11587NAr3",
          "icon_link": "https://mosaic.scdn.co/640/ab67616d0000b2730c737f964523efd62a34c37bab67616d0000b27323eb6fade291be0d5871be8aab67616d0000b273602042e91c5fd255189bdc12ab67616d0000b273a92938f97bc1c6503242b0af"
        },
        {
          "name": "Journey",
          "link": "https://api.spotify.com/v1/playlists/4hqD83tBw7cX2kuAQcskQj",
          "uri": "spotify:playlist:4hqD83tBw7cX2kuAQcskQj",
          "icon_link": "https://mosaic.scdn.co/640/ab67616d0000b27312eb1bd5c3227bd02001c37bab67616d0000b27352d0e82b97ec6422c697099aab67616d0000b273badc29f1dadb78abeb04e3bbab67616d0000b273e45d8e6e3919425938bcf8d8"
        },
        {
          "name": "Journey 80’s Mix",
          "link": "https://api.spotify.com/v1/playlists/2DfExg7pKo6htk5XwH0BYI",
          "uri": "spotify:playlist:2DfExg7pKo6htk5XwH0BYI",
          "icon_link": "https://mosaic.scdn.co/640/ab67616d0000b2731b2a9188ac775e16998eb78dab67616d0000b27363fa4751355b66f236943275ab67616d0000b273d514470784e3d02ee0bcdb80ab67616d0000b273f94a1b552aa382bf52c495b7"
        },
        {
          "name": "Late night journaling 📕✏️",
          "link": "https://api.spotify.com/v1/playlists/3GL43ZMShRLjKRLms8GosL",
          "uri": "spotify:playlist:3GL43ZMShRLjKRLms8GosL",
          "icon_link": "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000bebbd0ecfb4b80fdebb0cdef50c2"
        },
        {
          "name": "Journey - Tamil",
          "link": "https://api.spotify.com/v1/playlists/1KfMg0MT2pNAnE0bj3KETk",
          "uri": "spotify:playlist:1KfMg0MT2pNAnE0bj3KETk",
          "icon_link": "https://i.scdn.co/image/ab67616d0000b273b913803dbc6c661e6be966a1"
        }
      ]
    }
  }

  useEffect(() => {
    setSearchResults(response)
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container
        sx={{
          padding: 1,
          maxHeight: 'calc(100vh - 80px)'
        }}
      >
        <Grid item xs={3}>
          <MainHeaderCard />
        </Grid>

        <Grid item xs={9}>
          <Box sx={{
            padding: 1,
            height: expanded ? '100%' : '10vh',
          }}>
            <Search token={token} updatePool={updatePool} expanded={expanded} toggleExpanded={toggleExpanded} setSearchResults={setSearchResults} />
          </Box>
        </Grid>

        <Grid item xs={expanded ? 3 : 12} sx={{ height: 'calc(90vh - 80px)', overflow: 'auto' }}>
          <PoolManager pool={pool} token={token} updatePool={updatePool} expanded={expanded} />
        </Grid>

        {expanded &&
          <Grid item xs={9} sx={{ height: 'calc(90vh - 80px)', overflow: 'auto', paddingLeft: 1, }}>
            <Box sx={{
              display: 'flex',
              width: 1,
              bgcolor: 'secondary.dark',
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
            }}>
              <ExpandedSearchContent
                trackList={trackList}
                albumList={albumList}
                playlistList={playlistList}
                artistList={artistList}
                updatePool={updatePool}
                token={token}
                disabled={disabled}
                enableAddButton={enableAddButton}
              />
            </Box>
          </Grid>
        }

      </Grid>
      <Footer token={token} />
    </ThemeProvider >
  );
}
