export interface Track {
    name: string
    link: string
    uri: string
    artists: [
        {
            name: string
            link: string
        },
    ]
    album: {
        name: string
        link: string
        uri: string
        artists: [
            {
                name: string
                link: string
            },
        ]
        year: number
        icon_link: string
    }
    duration_ms: number
}


export interface Playlist {
    name: string
    link: string
    uri: string
    icon_link: string
}


export interface Artist {
    name: string
    link: string
    uri: string
    icon_link: string
}


export interface Album {
    name: string
    link: string
    uri: string
    artists: [
        {
            name: string
            link: string
        },
    ]
    year: number
    icon_link: string
}


export interface PoolTrack {
    name: string
    spotify_icon_uri: string
    spotify_track_uri: string
    duration_ms: number
}

export interface PoolCollection {
    name: string
    spotify_icon_uri: string
    spotify_collection_uri: string
    tracks: PoolTrack[]
}

export interface PoolUser {
    tracks: PoolTrack[]
    collections: PoolCollection[]
    user: {
        display_name: string
        icon_url: string
        spotify_id: string
    }
}

export interface Pool {
    users: PoolUser[]
    share_code: null
}