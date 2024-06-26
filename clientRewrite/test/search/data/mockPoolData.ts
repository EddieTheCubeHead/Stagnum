import { PlayableSpotifyResource } from "../../../src/search/models/PlayableSpotifyResource"
import { SpotifyTrack } from "../../../src/search/models/SpotifyTrack"
import { Pool } from "../../../src/common/models/Pool"

export const mockedCollectionPoolData = (): Pool => {
    return {
        users: [
            {
                tracks: [],
                collections: [
                    {
                        name: "Doris",
                        spotify_icon_uri: "https://i.scdn.co/image/ab67616d0000b2732d5bb55dd4d1cb7eafef984b",
                        spotify_resource_uri: "spotify:album:0ey6IpLrWoRlsjiXVmDjw3",
                        tracks: [
                            {
                                name: "Doris - 2003 Digital Remaster",
                                spotify_icon_uri: "https://i.scdn.co/image/ab67616d0000b2732d5bb55dd4d1cb7eafef984b",
                                spotify_resource_uri: "spotify:track:2nhdnaKozd5RGZc0TJCtmM",
                                duration_ms: 211080,
                            },
                            {
                                name: "Mikä Mahtaa Olla In? - 2003 Digital Remaster",
                                spotify_icon_uri: "https://i.scdn.co/image/ab67616d0000b2732d5bb55dd4d1cb7eafef984b",
                                spotify_resource_uri: "spotify:track:3IPwjDnXbVZZt8LCjxLee5",
                                duration_ms: 173960,
                            },
                            {
                                name: "Älä Soita Minulle - 2003 Digital Remaster",
                                spotify_icon_uri: "https://i.scdn.co/image/ab67616d0000b2732d5bb55dd4d1cb7eafef984b",
                                spotify_resource_uri: "spotify:track:3v0UuWczdVinoz5JnVQ2Tv",
                                duration_ms: 240626,
                            },
                            {
                                name: "Myrskytuuli - 2003 Digital Remaster",
                                spotify_icon_uri: "https://i.scdn.co/image/ab67616d0000b2732d5bb55dd4d1cb7eafef984b",
                                spotify_resource_uri: "spotify:track:3HEkfWSwu003SuYGwcOtpj",
                                duration_ms: 170120,
                            },
                            {
                                name: "Kotimaa - 2003 Digital Remaster",
                                spotify_icon_uri: "https://i.scdn.co/image/ab67616d0000b2732d5bb55dd4d1cb7eafef984b",
                                spotify_resource_uri: "spotify:track:63bYtXfi3luZEhMl0TYaDF",
                                duration_ms: 291360,
                            },
                            {
                                name: "Tähdenlento - 2003 Digital Remaster",
                                spotify_icon_uri: "https://i.scdn.co/image/ab67616d0000b2732d5bb55dd4d1cb7eafef984b",
                                spotify_resource_uri: "spotify:track:1trERhk965ofGs1LXn63eB",
                                duration_ms: 161703,
                            },
                            {
                                name: "Blues On Mun Kaveri - 2003 Digital Remaster",
                                spotify_icon_uri: "https://i.scdn.co/image/ab67616d0000b2732d5bb55dd4d1cb7eafef984b",
                                spotify_resource_uri: "spotify:track:0R15DGT9EcbsFZTG0ZR7w9",
                                duration_ms: 205653,
                            },
                            {
                                name: "Iltapäivän Ratoksi - 2003 Digital Remaster",
                                spotify_icon_uri: "https://i.scdn.co/image/ab67616d0000b2732d5bb55dd4d1cb7eafef984b",
                                spotify_resource_uri: "spotify:track:47xqHzRRaG8xuAod4MpwIc",
                                duration_ms: 180080,
                            },
                            {
                                name: "Soulbeibi - 2003 Digital Remaster",
                                spotify_icon_uri: "https://i.scdn.co/image/ab67616d0000b2732d5bb55dd4d1cb7eafef984b",
                                spotify_resource_uri: "spotify:track:0McOaAsK3oPy0X4XZtESls",
                                duration_ms: 238560,
                            },
                            {
                                name: "Oi Mikä Ihana Ilta - 2003 Digital Remaster",
                                spotify_icon_uri: "https://i.scdn.co/image/ab67616d0000b2732d5bb55dd4d1cb7eafef984b",
                                spotify_resource_uri: "spotify:track:5vYcHNT0mH00qQcgPM8TSc",
                                duration_ms: 241360,
                            },
                        ],
                    },
                ],
                user: {
                    display_name: "heiasi",
                    icon_url: "https://i.scdn.co/image/ab67757000003b82cee014d4fbe9c04281950e28",
                    spotify_id: "heiasi",
                },
            },
        ],
        currently_playing: {
            name: "Soulbeibi - 2003 Digital Remaster",
            spotify_icon_uri: "https://i.scdn.co/image/ab67616d0000b2732d5bb55dd4d1cb7eafef984b",
            spotify_resource_uri: "spotify:track:0McOaAsK3oPy0X4XZtESls",
            duration_ms: 238560,
        },
        share_code: null,
        owner: {
            display_name: "heiasi",
            icon_url: "https://i.scdn.co/image/ab67757000003b82cee014d4fbe9c04281950e28",
            spotify_id: "heiasi",
        },
    }
}

export const mockedTrackPoolData = (): Pool => {
    return {
        users: [
            {
                tracks: [
                    {
                        name: "Hauki",
                        spotify_icon_uri: "https://i.scdn.co/image/ab67616d0000b273ab00476f3bf0c7eca81ae6ed",
                        spotify_resource_uri: "spotify:track:7f05wyGvli2YmljnP2DohZ",
                        duration_ms: 204866,
                    },
                ],
                collections: [],
                user: {
                    display_name: "heiasi",
                    icon_url: "https://i.scdn.co/image/ab67757000003b82cee014d4fbe9c04281950e28",
                    spotify_id: "heiasi",
                },
            },
        ],
        currently_playing: {
            name: "Hauki",
            spotify_icon_uri: "https://i.scdn.co/image/ab67616d0000b273ab00476f3bf0c7eca81ae6ed",
            spotify_resource_uri: "spotify:track:7f05wyGvli2YmljnP2DohZ",
            duration_ms: 204866,
        },
        share_code: null,
        owner: {
            display_name: "heiasi",
            icon_url: "https://i.scdn.co/image/ab67757000003b82cee014d4fbe9c04281950e28",
            spotify_id: "heiasi",
        },
    }
}
