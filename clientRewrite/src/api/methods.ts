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

interface useApiGetParameters {
    params?: object
}

export const useApiGet = (path: string) => {
    const headers = useTokenHeader()
    const callDecorator = useCommonApiCallDecorator()
    return async ({ params }: useApiGetParameters) => {
        const fetchUrl = `${import.meta.env.VITE_BACKEND_URL}${path}`
        console.log("Getting", fetchUrl)
        return await callDecorator(axios.get(fetchUrl, { params, headers }))
    }
}

export const useApiPost = (path: string) => {
    const headers = useTokenHeader()
    const callDecorator = useCommonApiCallDecorator()
    return async <T extends object>(body: T) => {
        const postUrl = `${import.meta.env.VITE_BACKEND_URL}${path}`
        return await callDecorator(axios.post(postUrl, body, { headers }))
    }
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
