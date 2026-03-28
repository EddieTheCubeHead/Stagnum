import { usePoolStore } from "../../common/stores/poolStore.ts"
import { WarningPopup } from "../../common/components/WarningPopup.tsx"
import { useLeavePool } from "../hooks/useLeavePool.ts"
import { useMutatePool } from "../hooks/useMutatePool.ts"

const LEAVE_MUTATION = "leave"

export const ConfirmPoolLeaveModal = () => {
    const { clearPoolState } = usePoolStore()
    const cancelCallback = () => clearPoolState()
    const leavePool = useLeavePool()
    const confirmCallback = async () => {
        const pool = await leavePool()
        clearPoolState()
        return pool
    }
    const { mutate } = useMutatePool({ mutationFn: confirmCallback, mutationKey: [LEAVE_MUTATION] })
    const warningText = "You are about to leave your current playback pool. Do you wish to continue?"

    return (
        <WarningPopup
            warningText={warningText}
            cancelCallback={cancelCallback}
            confirmCallback={() => mutate(undefined)}
        />
    )
}
