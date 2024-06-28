import { CardBase } from "../../../common/components/cards/CardBase.tsx"
import { PlayableSpotifyResourceWithIcon } from "../../models/PlayableSpotifyResourceWithIcon.ts"
import { ReactNode } from "react"
import { PlayIconSvg } from "../../../common/icons/svgs/PlayIconSvg.tsx"
import { IconButton } from "../../../common/icons/IconButton.tsx"
import { useCreatePool } from "../../hooks/useCreatePool.ts"
import { PlayableSpotifyResource } from "../../models/PlayableSpotifyResource.ts"
import { usePoolStore } from "../../../common/stores/poolStore.ts"
import { AddIconSvg } from "../../../common/icons/svgs/AddIconSvg.tsx"
import { useAddToPool } from "../../hooks/useAddToPool.ts"

interface SearchResourceCardProps {
    resource: PlayableSpotifyResource
    iconSource: PlayableSpotifyResourceWithIcon
    nameField: ReactNode
}

export const SearchResourceCard = ({ resource, iconSource, nameField }: SearchResourceCardProps) => {
    const createPool = useCreatePool(resource)
    const addToPool = useAddToPool(resource)
    const { setConfirmingOverwrite, pool } = usePoolStore()
    const createPoolOnClick = pool === null ? createPool : () => setConfirmingOverwrite(resource)
    return (
        <CardBase>
            <img
                src={iconSource.icon_link}
                alt={`Album: ${iconSource.name} icon`}
                className="h-iconSize w-iconSize pointer-events-none select-none"
            />
            {nameField}
            <div className="grow" />
            <IconButton svg={<AddIconSvg />} onClick={addToPool} />
            <IconButton svg={<PlayIconSvg />} onClick={createPoolOnClick} />
        </CardBase>
    )
}
