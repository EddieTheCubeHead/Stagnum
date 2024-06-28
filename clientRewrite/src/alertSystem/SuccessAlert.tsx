import { Alert } from "./Alert.ts"

interface SuccessAlertProps {
    alert: Alert
}

export const SuccessAlert = ({ alert }: SuccessAlertProps) => {
    return <div>{alert.message}</div>
}
