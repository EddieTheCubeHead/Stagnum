import { Alert, AlertType } from "./Alert.ts"
import { AlertComponentBase } from "./AlertComponentBase.tsx"
import { IconButton } from "../common/icons/IconButton.tsx"
import { CloseIconSvg } from "../common/icons/svgs/CloseIconSvg.tsx"
import { Size } from "../common/constants/size.ts"
import { useAlertStore } from "./alertStore.ts"

interface ErrorAlertProps {
    alert: Alert
}

export const ErrorAlert = ({ alert }: ErrorAlertProps) => {
    const { removeAlert } = useAlertStore()
    return (
        <AlertComponentBase type={AlertType.Error}>
            <p className="text-xs line-clamp-none pointer-events-none text-pretty whitespace-normal">{alert.message}</p>
            <IconButton onClick={() => removeAlert(alert)} svg={<CloseIconSvg />} size={Size.md} />
        </AlertComponentBase>
    )
}
