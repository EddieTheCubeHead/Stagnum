import { LOCALSTORAGE_TOKEN_KEY } from "../common/constants/localStorage.ts"
import { useSyncExternalStore } from "react"

class TokenHolder {
    private token: string | null = null
    private listeners: Array<() => void> = []

    constructor() {
        this.token = localStorage.getItem(LOCALSTORAGE_TOKEN_KEY)
        console.log("Constructor: ", this.token)
    }

    setToken(token: string | null) {
        if (this.token === token) {
            return
        }
        if (token === null) {
            localStorage.removeItem(LOCALSTORAGE_TOKEN_KEY)
        } else {
            localStorage.setItem(LOCALSTORAGE_TOKEN_KEY, token)
        }
        this.token = token
        this.emit()
    }

    subscribe(listener: () => void) {
        this.listeners.push(listener)
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener)
        }
    }

    emit() {
        for (const listener of this.listeners) {
            listener()
        }
    }

    getToken() {
        return this.token
    }
}

export const tokenHolder = new TokenHolder()

export const useToken = () => {
    return useSyncExternalStore(
        (fn: () => void) => tokenHolder.subscribe(fn),
        () => tokenHolder.getToken(),
    )
}
