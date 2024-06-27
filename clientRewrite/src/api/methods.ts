import axios, { AxiosHeaders, AxiosResponse } from "axios"
import { useTokenStore } from "../common/stores/tokenStore.ts"

export const apiGet = async (path: string, token?: string, params?: object) => {
    const headers = new AxiosHeaders()
    if (token) {
        headers.set("Authorization", token)
    }

    const fetchUrl = `${import.meta.env.VITE_BACKEND_URL}${path}`
    return await axios.get(fetchUrl, { params, headers })
}

export const apiPost = async <T extends object>(path: string, body: T, token: string) => {
    const headers = new AxiosHeaders()
    headers.set("Authorization", token)
    const postUrl = `${import.meta.env.VITE_BACKEND_URL}${path}`
    return await axios.post(postUrl, body, { headers })
}

export const useApiDelete = (path: string) => {
    const headers = useTokenHeader()
    const callDecorator = useCommonApiCallDecorator()
    return async () => {
        const deleteUrl = `${import.meta.env.VITE_BACKEND_URL}${path}`
        return await callDecorator(axios.delete(deleteUrl, { headers }))
    }
}

const useCommonApiCallDecorator = () => {
    const { setToken } = useTokenStore()
    return async (request: Promise<AxiosResponse<any>>) => {
        const response = await request
        const newHeader = response.config.headers["Authorization"] as string | undefined
        setToken(newHeader ? newHeader : null)
        return response.data
    }
}

const useTokenHeader = () => {
    const { token } = useTokenStore()
    const headers = new AxiosHeaders()
    headers.set("Authorization", token)
    return headers
}
