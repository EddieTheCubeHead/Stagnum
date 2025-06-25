import { usePoolStore } from "../../common/stores/poolStore.ts"
import { useDeletePool } from "../hooks/useDeletePool.ts"
import { WarningPopup } from "../../common/components/WarningPopup.tsx"

export const ConfirmPoolDeleteModal = () => {
    const { clearPoolState } = usePoolStore()
    const cancelCallback = () => clearPoolState()
    const deletePool = useDeletePool()
    const confirmCallback = () => {
        deletePool()
        clearPoolState()
    }
    const warningText =
        "You are about to delete your current playback pool! This cannot be reversed. Do you wish to continue?"

    return <WarningPopup warningText={warningText} cancelCallback={cancelCallback} confirmCallback={confirmCallback} />
}
