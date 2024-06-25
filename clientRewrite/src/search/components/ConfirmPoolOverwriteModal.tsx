import { PopupCard } from "../../common/components/PopupCard.tsx"
import { Size } from "../../common/constants/size.ts"
import { Button, ButtonVariant } from "../../common/components/Button.tsx"
import { usePoolStore } from "../../common/stores/poolStore.ts"
import { useCreatePool } from "../hooks/useCreatePool.ts"

export const ConfirmPoolOverwriteModal = () => {
    const { setConfirmingOverwrite, confirmingOverwrite } = usePoolStore()
    const onAccept = useCreatePool(confirmingOverwrite)
    const confirmCallback = () => {
        setConfirmingOverwrite("")
        onAccept()
    }
    return (
        <PopupCard size={Size.s}>
            <div className="flex-col p-4 space-y-2">
                <h3 className="text-center text-xl text-error font-bold">Warning!</h3>
                <p className="text-center font-light">
                    Creating a new playback pool will overwrite your current one! Are you sure you want to continue?
                </p>
                <div className="flex justify-center space-x-2">
                    <Button variant={ButtonVariant.Warn} onClick={() => setConfirmingOverwrite("")} text="Cancel" />
                    <Button variant={ButtonVariant.Confirm} onClick={confirmCallback} text="Continue" />
                </div>
            </div>
        </PopupCard>
    )
}
