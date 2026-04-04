import { Route } from "../../routes/__root.tsx"
import { z } from "zod"
import { ModalSchema } from "./modalTypes.ts"
import { useNavigate } from "@tanstack/react-router"

export const useModals = () => {
    const { modal }: { modal: z.infer<typeof ModalSchema> | undefined } = Route.useSearch()
    const navigate = useNavigate()
    const setModal = (modal: z.infer<typeof ModalSchema> | undefined) => {
        void navigate({
            to: ".",
            search: (prev: any) => ({ ...prev, modal }),
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
