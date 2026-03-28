import { usePoolStore } from "../../common/stores/poolStore.ts"
import { useCreatePool } from "../../search/hooks/useCreatePool.ts"
import { WarningPopup } from "../../common/components/WarningPopup.tsx"
import { useMutatePool } from "../hooks/useMutatePool.ts"

const OVERWRITE_MUTATION = "overwrite"

export const ConfirmPoolOverwriteModal = () => {
    const { setConfirmingOverwrite, confirmingOverwrite } = usePoolStore()
    const onAccept = useCreatePool(confirmingOverwrite ?? { name: "", uri: "", link: "" })
    const confirmCallback = async () => {
        const pool = await onAccept()
        setConfirmingOverwrite(null)
        return pool
    }
    const cancelCallback = () => setConfirmingOverwrite(null)
    const warningText =
        "Creating a new playback pool will overwrite your current one! Are you sure you want to continue?"
    const { mutate } = useMutatePool({ mutationFn: confirmCallback, mutationKey: [OVERWRITE_MUTATION] })

    if (confirmingOverwrite === null) {
        return null
    }
    return (
        <WarningPopup
            warningText={warningText}
            cancelCallback={cancelCallback}
            confirmCallback={() => mutate(undefined)}
        />
    )
}
