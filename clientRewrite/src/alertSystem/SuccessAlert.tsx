import { Alert, AlertType } from "./Alert.ts"
import { AlertComponentBase } from "./AlertComponentBase.tsx"
import { useEffect } from "react"
import { useAlertStore } from "./alertStore.ts"

interface SuccessAlertProps {
    alert: Alert
}

export const SuccessAlert = ({ alert }: SuccessAlertProps) => {
    const { removeAlert } = useAlertStore()
    useEffect(() => {
        const timer = setTimeout(() => removeAlert(alert), 7000)
        return () => clearTimeout(timer)
    }, [alert])
    return (
        <AlertComponentBase type={AlertType.Success}>
            <p className="text-xs grow pointer-events-none">{alert.message}</p>
        </AlertComponentBase>
    )
}
