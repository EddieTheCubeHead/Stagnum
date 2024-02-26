export default interface Track {
    name: string,
    uri: string,
    artists: [
        {
            name: string,
            link: string
        }
    ],
    album: {
        name: string,
        link: string
    },
    duration_ms: number
}