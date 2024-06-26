interface SimpleArtistData {
    name: string
    link: string
}

export interface Track {
    name: string
    link: string
    uri: string
    artists: SimpleArtistData[]
    album: Album
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
    artists: SimpleArtistData[]
    year: number
    icon_link: string
}

export interface PoolTrack {
    name: string
    spotify_icon_uri: string
    spotify_resource_uri: string
    duration_ms: number
}

export interface PoolCollection {
    name: string
    spotify_icon_uri: string
    spotify_resource_uri: string
    tracks: PoolTrack[]
}

export interface PoolUser {
    tracks: PoolTrack[]
    collections: PoolCollection[]
    user: User
}

export interface Pool {
    currently_playing: PoolTrack
    users: PoolUser[]
    share_code: null
    owner: User | null
}

export interface User {
    display_name: string
    icon_url: string
    spotify_id: string
}
