import { CardBase } from "../../../common/components/cards/CardBase.tsx"
import { PlayableSpotifyResourceWithIcon } from "../../models/PlayableSpotifyResourceWithIcon.ts"
import { ReactNode } from "react"
import { PlayIconSvg } from "../../../common/icons/svgs/PlayIconSvg.tsx"
import { IconButton } from "../../../common/icons/IconButton.tsx"
import { useCreatePool } from "../../hooks/useCreatePool.ts"
import { PlayableSpotifyResource } from "../../models/PlayableSpotifyResource.ts"
import { usePoolStore } from "../../../common/stores/poolStore.ts"

interface SearchResourceCardProps {
    resource: PlayableSpotifyResource
    iconSource: PlayableSpotifyResourceWithIcon
    nameField: ReactNode
}

export const SearchResourceCard = ({ resource, iconSource, nameField }: SearchResourceCardProps) => {
    const createPool = useCreatePool(resource.uri)
    const { setConfirmingOverwrite, pool } = usePoolStore()
    const createPoolOnClick = pool === null ? createPool : () => setConfirmingOverwrite(resource.uri)
    return (
        <CardBase>
            <img
                src={iconSource.icon_link}
                alt={`Album: ${iconSource.name} icon`}
                className="h-iconSize w-iconSize pointer-events-none select-none"
            />
            {nameField}
            <div className="grow"></div>
            <IconButton svg={<PlayIconSvg />} onClick={createPoolOnClick} />
        </CardBase>
    )
}
