import { usePoolStore } from "../../common/stores/poolStore.ts"
import { WarningPopup } from "../../common/components/WarningPopup.tsx"
import { useLeavePool } from "../hooks/useLeavePool.ts"

export const ConfirmPoolLeaveModal = () => {
    const { clearPoolState } = usePoolStore()
    const cancelCallback = () => clearPoolState()
    const leavePool = useLeavePool()
    const confirmCallback = () => {
        leavePool()
        clearPoolState()
    }
    const warningText = "You are about to leave your current playback pool. Do you wish to continue?"

    return <WarningPopup warningText={warningText} cancelCallback={cancelCallback} confirmCallback={confirmCallback} />
}
