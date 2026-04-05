import { Route } from "../../routes/__root.tsx"
import { z } from "zod"
import { ModalSchema } from "./modalTypes.ts"
import { useNavigate } from "@tanstack/react-router"

type Modal = z.infer<typeof ModalSchema> | undefined

export const useModals = () => {
    const { modal }: { modal: Modal } = Route.useSearch()
    const navigate = useNavigate()
    const setModal = (newModal: Modal) => {
        void navigate({
            to: ".",
            search: ({ modal, ...prev }: { modal: Modal }) => ({ ...prev, modal: newModal }),
        })
    }
    const clearModal = () => {
        setModal(undefined)
    }

    return {
        clearModal,
        modal,
        setModal,
    }
}
