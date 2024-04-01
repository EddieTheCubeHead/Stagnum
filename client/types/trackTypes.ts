
interface Artist {
    name: string
    link: string
}

export default interface Track {
    name: string,
    link: string,
    uri: string,
    artists: [
        {
            name: string,
            link: string
        }
    ],
    album: {
        name: string,
        link: string,
        uri: string,
        artists: [
            {
                name: string,
                link: string
            }
        ],
        year: number,
        icon_link: string
    },
    duration_ms: number
}