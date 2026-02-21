import { LoginPopup } from "../../login/components/loginPopup/LoginPopup.tsx"
import { ReactNode } from "react"
import { useTokenQuery } from "../hooks/useTokenQuery.ts"

interface EnsureLoginWrapperProps {
    view?: ReactNode
}

export const EnsureLoginWrapper = ({ view }: EnsureLoginWrapperProps) => {
    const { token } = useTokenQuery()
    return token === null ? <LoginPopup /> : view
}
