import { useModals } from "./useModals.ts"
import { ConfirmPoolOverwriteModal } from "../../pool/components/ConfirmPoolOverwriteModal.tsx"
import { ConfirmPoolLeaveModal } from "../../pool/components/ConfirmPoolLeaveModal.tsx"
import { ConfirmPoolDeleteModal } from "../../pool/components/ConfirmPoolDeleteModal.tsx"

export const ModalRenderer = () => {
    const { modal } = useModals()

    if (!modal) {
        return null
    }

    switch (modal.type) {
        case "ConfirmPoolOverwrite":
            return <ConfirmPoolOverwriteModal {...modal.props} />
        case "ConfirmLeavePool":
            return <ConfirmPoolLeaveModal />
        case "ConfirmDeletePool":
            return <ConfirmPoolDeleteModal />
    }
}
