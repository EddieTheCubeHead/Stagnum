import Artist from './artistTypes'

export default interface Album {
    name: string,
    link: string,
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
