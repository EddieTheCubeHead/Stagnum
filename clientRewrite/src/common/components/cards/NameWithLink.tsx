import { NamedSpotifyResource } from "../../models/NamedSpotifyResource.ts"

interface NameWithLinkProps {
    resource: NamedSpotifyResource
}

export const NameWithLink = ({ resource }: NameWithLinkProps) => {
    return (
        <a className="text-text hover:underline" href={resource.link}>
            {resource.name}
        </a>
    )
}
