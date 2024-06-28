import { ReactNode } from "react"
import { AlertType } from "./Alert.ts"

interface AlertComponentBaseProps {
    children?: ReactNode
    type: AlertType
}

export const AlertComponentBase = ({ children, type }: AlertComponentBaseProps) => {
    const borderColor = type === AlertType.Success ? "border-confirm" : "border-error"
    return (
        <div
            className={`pl-2 grow h-10 bg-elementBackground-1 border-2 ${borderColor} rounded-xl flex items-center justify-center`}
        >
            {children}
        </div>
    )
}
