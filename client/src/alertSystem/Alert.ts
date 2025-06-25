export const enum AlertType {
    Success,
    Error,
}

export type Alert = {
    type: AlertType
    message: string
}
