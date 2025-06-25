import { Alert, AlertType } from "./Alert.ts"
import { IconButton } from "../common/icons/IconButton.tsx"
import { CloseIconSvg } from "../common/icons/svgs/CloseIconSvg.tsx"
import { Size } from "../common/constants/size.ts"
import { useAlertStore } from "./alertStore.ts"
import { useEffect } from "react"

interface AlertComponentBaseProps {
    alert: Alert
}

export const AlertComponent = ({ alert }: AlertComponentBaseProps) => {
    const { removeAlert } = useAlertStore()
    useEffect(() => {
        if (alert.type === AlertType.Success) {
            const timer = setTimeout(() => removeAlert(alert), 5000)
            return () => clearTimeout(timer)
        }
    }, [alert])
    const color = alert.type === AlertType.Success ? "border-confirm bg-confirm-bg" : "border-error bg-error-bg"
    return (
        <div className={`p-2 min-h-10 min-w-0 border-2 ${color} rounded-xl flex items-center justify-center`}>
            <p className="text-xs grow line-clamp-none pointer-events-none text-pretty whitespace-normal">
                {alert.message}
            </p>
            <IconButton onClick={() => removeAlert(alert)} svg={<CloseIconSvg />} size={Size.md} />
        </div>
    )
}
