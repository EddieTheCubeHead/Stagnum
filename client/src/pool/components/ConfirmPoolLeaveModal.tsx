import { WarningPopup } from "../../common/components/WarningPopup.tsx"
import { useLeavePool } from "../hooks/useLeavePool.ts"
import { useMutatePool } from "../hooks/useMutatePool.ts"
import { useModals } from "../../common/modals/useModals.ts"

const LEAVE_MUTATION = "leave"

export const ConfirmPoolLeaveModal = () => {
    const { clearModal } = useModals()
    const cancelCallback = () => clearModal()
    const leavePool = useLeavePool()
    const confirmCallback = async () => {
        const pool = await leavePool()
        clearModal()
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
