export default interface Album {
    name: string,
    uri: string,
    artists: [
        {
            name: string,
            link: string
        }
    ],
    year: 0,
    icon_link: string
}