import axios, { AxiosHeaders, AxiosResponse } from "axios"
import { useAlertStore } from "../alertSystem/alertStore.ts"
import { Alert, AlertType } from "../alertSystem/Alert.ts"
import { tokenHolder } from "./tokenHolder.ts"

export const rawApiGet = async <T>(path: string, params?: object) => {
    const headers = new AxiosHeaders()
    const fetchUrl = `${import.meta.env.VITE_BACKEND_URL}${path}`
    return await axios.get<T>(fetchUrl, { params, headers })
}

interface useApiGetParameters {
    params?: object
}

export const apiGet = <T>(path: string, silent: boolean = false) => {
    const headers = buildTokenHeaders()
    const callDecorator = commonApiCallDecorator<T>(silent)
    return async ({ params }: useApiGetParameters = {}): Promise<T> => {
        const fetchUrl = `${import.meta.env.VITE_BACKEND_URL}${path}`
        return await callDecorator(axios.get<T>(fetchUrl, { params, headers }))
    }
}

export const apiPost = <TReturn>(path: string, silent: boolean = false) => {
    const headers = buildTokenHeaders()
    const callDecorator = commonApiCallDecorator<TReturn>(silent)
    return async <TBody extends object>(body: TBody): Promise<TReturn> => {
        const postUrl = `${import.meta.env.VITE_BACKEND_URL}${path}`
        return await callDecorator(axios.post<TReturn>(postUrl, body, { headers }))
    }
}

export const apiDelete = <T>(path: string, silent: boolean = false) => {
    const headers = buildTokenHeaders()
    const callDecorator = commonApiCallDecorator<T>(silent)
    return async (): Promise<T> => {
        const deleteUrl = `${import.meta.env.VITE_BACKEND_URL}${path}`
        return await callDecorator(axios.delete<T>(deleteUrl, { headers }))
    }
}

const commonApiCallDecorator = <T>(silent: boolean = false) => {
    const addAlert = useAlertStore().addAlert
    return async (request: Promise<AxiosResponse<T>>) => {
        const response = await handleRequestErrors(silent, request, addAlert)
        const newHeader = response.config?.headers["Authorization"] as string | undefined
        tokenHolder.setToken(newHeader ?? null)
        return response.data
    }
}

const handleRequestErrors = async <T>(
    silent: boolean,
    request: Promise<AxiosResponse<T>>,
    addAlert: (alert: Alert) => void,
): Promise<AxiosResponse<T>> => {
    try {
        return await request
    } catch (error) {
        if (!silent) {
            // @ts-expect-error Axios error typing
            addAlert({ type: AlertType.Error, message: error.response.data.detail })
        }
        throw error
    }
}

const buildTokenHeaders = () => {
    const token = tokenHolder.getToken()
    if (token === undefined) {
        throw new Error("Attempted authorized fetch without user token!")
    }
    const headers = new AxiosHeaders()
    headers.set("Authorization", token)
    return headers
}
