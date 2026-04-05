import { useDeletePool } from "../hooks/useDeletePool.ts"
import { WarningPopup } from "../../common/components/WarningPopup.tsx"
import { useMutatePool } from "../hooks/useMutatePool.ts"
import { useModals } from "../../common/modals/useModals.ts"

const DELETE_POOL_MUTATION = "deletePool"

export const ConfirmPoolDeleteModal = () => {
    const { clearModal } = useModals()
    const cancelCallback = () => clearModal()
    const deletePool = useDeletePool()
    const confirmCallback = async () => {
        const pool = await deletePool()
        clearModal()
        return pool
    }
    const { mutate } = useMutatePool({ mutationFn: confirmCallback, mutationKey: [DELETE_POOL_MUTATION] })
    const warningText =
        "You are about to delete your current playback pool! This cannot be reversed. Do you wish to continue?"

    return (
        <WarningPopup
            warningText={warningText}
            cancelCallback={cancelCallback}
            confirmCallback={() => mutate(undefined)}
        />
    )
}
