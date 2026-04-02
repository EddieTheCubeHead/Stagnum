import { Alert, AlertType } from "./Alert.ts"
import { create } from "zustand"

interface AlertStore {
    alerts: Alert[]
    addAlert: (alert: Alert) => void
    removeAlert: (alert: Alert) => void
}

const removeAlert = (state: AlertStore, alert: Alert) => ({
    alerts: state.alerts.filter((existingAlert) => existingAlert !== alert),
})

const ALERT_TIMEOUT = 7 * 1000

export const useAlertStore = create<AlertStore>((set) => ({
    alerts: [],
    removeAlert: (alert: Alert) => {
        set((state) => removeAlert(state, alert))
    },
    addAlert: (alert: Alert) => {
        set((state) => ({
            alerts: [...state.alerts, alert],
        }))
        if (alert.type === AlertType.Success) {
            setTimeout(() => set((state) => removeAlert(state, alert)), ALERT_TIMEOUT)
        }
    },
}))
