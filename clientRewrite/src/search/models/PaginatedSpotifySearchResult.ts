import { PlayableSpotifyResource } from "./PlayableSpotifyResource.ts"

export interface PaginatedSpotifySearchResult<TModel extends PlayableSpotifyResource> {
    limit: number
    offset: number
    total: number
    self_page_link: string
    next_page_link: string
    items: TModel[]
}
