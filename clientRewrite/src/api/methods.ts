import axios, { AxiosError, AxiosHeaders, AxiosResponse } from "axios"
import { useTokenStore } from "../common/stores/tokenStore.ts"
import { useAlertStore } from "../alertSystem/alertStore.ts"
import { Alert, AlertType } from "../alertSystem/Alert.ts"

export const apiGet = async (path: string, token?: string, params?: object) => {
    const headers = new AxiosHeaders()
    if (token) {
        headers.set("Authorization", token)
    }

    const fetchUrl = `${import.meta.env.VITE_BACKEND_URL}${path}`
    return await axios.get(fetchUrl, { params, headers })
}

interface useApiGetParameters {
    params?: object
}

export const useApiGet = <T>(path: string, silent: boolean = false) => {
    const headers = useTokenHeader()
    const callDecorator = useCommonApiCallDecorator<T>(silent)
    return async ({ params }: useApiGetParameters): Promise<T> => {
        const fetchUrl = `${import.meta.env.VITE_BACKEND_URL}${path}`
        return await callDecorator(axios.get(fetchUrl, { params, headers }))
    }
}

export const useApiPost = <TReturn>(path: string, silent: boolean = false) => {
    const headers = useTokenHeader()
    const callDecorator = useCommonApiCallDecorator<TReturn>(silent)
    return async <TBody extends object>(body: TBody): Promise<TReturn> => {
        const postUrl = `${import.meta.env.VITE_BACKEND_URL}${path}`
        return await callDecorator(axios.post(postUrl, body, { headers }))
    }
}

export const useApiDelete = <T>(path: string, silent: boolean = false) => {
    const headers = useTokenHeader()
    const callDecorator = useCommonApiCallDecorator<T>(silent)
    return async (): Promise<T> => {
        const deleteUrl = `${import.meta.env.VITE_BACKEND_URL}${path}`
        return await callDecorator(axios.delete(deleteUrl, { headers }))
    }
}

const useCommonApiCallDecorator = <T>(silent: boolean = false) => {
    const { setToken } = useTokenStore()
    const { addAlert } = useAlertStore()
    return async (request: Promise<AxiosResponse<T>>) => {
        const response = await handleRequestErrors(silent, request, addAlert)
        const newHeader = response.config.headers["Authorization"] as string | undefined
        setToken(newHeader ? newHeader : null)
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

        // https://github.com/axios/axios/issues/3612
        // @ts-expect-error - Correctly typing catches with axios error seems convoluted, not going to waste time on it
    } catch (error: AxiosError) {
        if (!silent) {
            addAlert({ type: AlertType.Error, message: error.response.data.detail })
        }
        throw error
    }
}

const useTokenHeader = () => {
    const { token } = useTokenStore()
    const headers = new AxiosHeaders()
    headers.set("Authorization", token)
    return headers
}
