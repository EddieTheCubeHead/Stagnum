import { usePoolStore } from "../../common/stores/poolStore.ts"
import { useCreatePool } from "../../search/hooks/useCreatePool.ts"
import { WarningPopup } from "../../common/components/WarningPopup.tsx"

export const ConfirmPoolOverwriteModal = () => {
    const { setConfirmingOverwrite, confirmingOverwrite } = usePoolStore()
    const onAccept = useCreatePool(confirmingOverwrite ?? { name: "", uri: "", link: "" })
    const confirmCallback = () => {
        onAccept()
        setConfirmingOverwrite(null)
    }
    const cancelCallback = () => setConfirmingOverwrite(null)
    const warningText =
        "Creating a new playback pool will overwrite your current one! Are you sure you want to continue?"
    if (confirmingOverwrite === null) {
        return null
    }
    return <WarningPopup warningText={warningText} cancelCallback={cancelCallback} confirmCallback={confirmCallback} />
}
