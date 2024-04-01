interface PoolTrack {
    name: string
    spotify_icon_uri: string
    spotify_track_uri: string
    duration_ms: number
}

interface PoolCollection {
    name: string
    spotify_icon_uri: string
    spotify_collection_uri: string
    tracks: PoolTrack[]
}

interface PoolUser {
    tracks: PoolTrack[]
    collections: PoolCollection[]
    user: {
        display_name: string
        icon_url: string
        spotify_id: string
    }
}

interface Pool {
    users: PoolUser[]
    share_code: null
}
