import { useModals } from "./useModals.ts"
import { ConfirmPoolOverwriteModal } from "../../pool/components/ConfirmPoolOverwriteModal.tsx"

export const ModalRenderer = () => {
    const { modal } = useModals()

    if (!modal) {
        return null
    }

    switch (modal.type) {
        case "ConfirmPoolOverwrite":
            return <ConfirmPoolOverwriteModal {...modal.props} />
    }
}
