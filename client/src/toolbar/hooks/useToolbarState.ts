import { useNavigate, useSearch } from "@tanstack/react-router"
import { useCallback } from "react"

export const useToolbarState = () => {
    const { action } = useSearch({ from: "__root__" })
    const navigate = useNavigate()

    const setState = useCallback((newState: typeof action) => {
        void navigate({
            from: "/",
            params: (prev) => prev,
            search: (prev) => ({ ...prev, action: newState }),
            replace: true,
        })
    }, [])

    return {
        state: action,
        setState,
    }
}
