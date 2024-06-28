import { ReactNode } from "react"
import { AlertType } from "./Alert.ts"

interface AlertComponentBaseProps {
    children?: ReactNode
    type: AlertType
}

export const AlertComponentBase = ({ children, type }: AlertComponentBaseProps) => {
    const color = type === AlertType.Success ? "border-confirm bg-confirm-bg" : "border-error bg-error-bg"
    return (
        <div className={`p-2 min-h-10 min-w-0 border-2 ${color} rounded-xl flex items-center justify-center`}>
            {children}
        </div>
    )
}
