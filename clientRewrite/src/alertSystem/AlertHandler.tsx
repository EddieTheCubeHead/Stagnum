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
        <div className="fixed top-bigCardHeight flex justify-center pointer-events-none w-full select-none">
            <div className="py-4 max-w-2/3 min-w-64 flex-col z-50 space-y-1 overflow-y-auto max-h-96 justify-center pointer-events-auto">
                {alerts.map((alert) =>
                    alert.type === AlertType.Success ? <SuccessAlert alert={alert} /> : <ErrorAlert alert={alert} />,
                )}
            </div>
        </div>
    )
}
