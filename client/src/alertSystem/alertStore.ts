import { Alert } from "./Alert.ts"
import { create } from "zustand"

interface AlertStore {
    alerts: Alert[]
    addAlert: (alert: Alert) => void
    removeAlert: (alert: Alert) => void
}

export const useAlertStore = create<AlertStore>((set) => ({
    alerts: [],
    addAlert: (alert: Alert) => {
        set((state) => ({
            alerts: [...state.alerts, alert],
        }))
    },
    removeAlert: (alert: Alert) => {
        set((state) => ({
            alerts: state.alerts.filter((existingAlert) => existingAlert !== alert),
        }))
    },
}))
