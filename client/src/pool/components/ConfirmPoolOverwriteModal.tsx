import { useCreatePool } from "../../search/hooks/useCreatePool.ts"
import { WarningPopup } from "../../common/components/WarningPopup.tsx"
import { useMutatePool } from "../hooks/useMutatePool.ts"
import { PlayableSpotifyResource } from "../../search/models/PlayableSpotifyResource.ts"
import { useModals } from "../../common/modals/useModals.ts"

const OVERWRITE_MUTATION = "overwrite"

interface ConfirmPoolOverwriteModalProps {
    newPoolResource: PlayableSpotifyResource
}

export const ConfirmPoolOverwriteModal = ({ newPoolResource }: ConfirmPoolOverwriteModalProps) => {
    const { clearModal } = useModals()
    const onAccept = useCreatePool(newPoolResource)
    const confirmCallback = async () => {
        const pool = await onAccept()
        clearModal()
        return pool
    }
    const cancelCallback = () => clearModal()
    const warningText =
        "Creating a new playback pool will overwrite your current one! Are you sure you want to continue?"
    const { mutate } = useMutatePool({ mutationFn: confirmCallback, mutationKey: [OVERWRITE_MUTATION] })

    return (
        <WarningPopup
            warningText={warningText}
            cancelCallback={cancelCallback}
            confirmCallback={() => mutate(undefined)}
        />
    )
}
