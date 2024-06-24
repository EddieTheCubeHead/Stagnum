import { CardBase } from "../../../common/components/cards/CardBase.tsx"
import { PlayableSpotifyResourceWithIcon } from "../../models/PlayableSpotifyResourceWithIcon.ts"
import { ReactNode } from "react"

interface SearchResourceCardProps {
    iconSource: PlayableSpotifyResourceWithIcon
    nameField: ReactNode
}

export const SearchResourceCard = ({ iconSource, nameField }: SearchResourceCardProps) => {
    return (
        <CardBase>
            <img
                src={iconSource.icon_link}
                alt={`Album: ${iconSource.name} icon`}
                className="h-iconSize w-iconSize pointer-events-none select-none"
            />
            {nameField}
        </CardBase>
    )
}
