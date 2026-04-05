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
import { useMutatePool } from "../../../pool/hooks/useMutatePool.ts"
import { useModals } from "../../../common/modals/useModals.ts"

interface SearchResourceCardProps {
    resource: PlayableSpotifyResource
    iconSource: PlayableSpotifyResourceWithIcon
    nameField: ReactNode
}

const CREATE_MUTATION = "create"

export const SearchResourceCard = ({ resource, iconSource, nameField }: SearchResourceCardProps) => {
    const createPool = useCreatePool(resource)
    const { setModal } = useModals()
    const { mutate } = useMutatePool({ mutationFn: createPool, mutationKey: [CREATE_MUTATION] })
    const addToPool = useAddToPool(resource)
    const { pool } = usePoolStore()
    const createPoolOnClick =
        pool === null
            ? () => mutate(undefined)
            : () => setModal({ type: "ConfirmPoolOverwrite", props: { newPoolResource: resource } })
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
