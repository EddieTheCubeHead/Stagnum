import Artist from "./artistTypes"

export default interface Track {
    name: string,
    uri: string,
    artists: Artist[],
    album: {
        name: string,
        link: string
    },
    duration_ms: number
}