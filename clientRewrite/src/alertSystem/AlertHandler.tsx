import { useAlertStore } from "./alertStore.ts"
import { AlertType } from "./Alert.ts"
import { ErrorAlert } from "./ErrorAlert.tsx"
import { SuccessAlert } from "./SuccessAlert.tsx"

export const AlertHandler = () => {
    const { alerts } = useAlertStore()
    if (!alerts) {
        return null
    }
    return (
        <div className="fixed top-bigCardHeight flex justify-center pointer-events-none w-full select-none z-50">
            <div className="py-4 max-w-128 min-w-0 flex-col space-y-1 overflow-x-auto text-wrap max-h-96 justify-center pointer-events-auto">
                {alerts.map((alert) =>
                    alert.type === AlertType.Success ? <SuccessAlert alert={alert} /> : <ErrorAlert alert={alert} />,
                )}
            </div>
        </div>
    )
}
