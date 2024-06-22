import { LoginPopup } from "../../login/components/loginPopup/LoginPopup.tsx"
import { useTokenStore } from "../stores/tokenStore.ts"
import { ReactNode } from "react"

interface EnsureLoginWrapperProps {
    view?: ReactNode
}

export const EnsureLoginWrapper = ({ view }: EnsureLoginWrapperProps) => {
    const token = useTokenStore().token
    return token === null ? <LoginPopup /> : view
}
