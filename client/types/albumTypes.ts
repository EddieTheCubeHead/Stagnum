import Artist from "./artistTypes";

export default interface Album {
    name: string,
    uri: string,
    artists: Artist[],
    year: number,
    icon_link: string
}