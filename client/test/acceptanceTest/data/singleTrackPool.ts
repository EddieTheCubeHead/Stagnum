import { Pool } from "../../../src/common/models/Pool.ts"

export const mockedTrackPoolData: Pool = {
    users: [
        {
            tracks: [
                {
                    id: 1,
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
    owner: {
        display_name: "heiasi",
        icon_url: "https://i.scdn.co/image/ab67757000003b82cee014d4fbe9c04281950e28",
        spotify_id: "heiasi",
    },
    is_active: true,
}
