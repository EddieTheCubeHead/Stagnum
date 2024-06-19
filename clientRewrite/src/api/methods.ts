import axios, { AxiosHeaders } from "axios"

export const get = async (path: string, token?: string, params?: object) => {
    const headers = new AxiosHeaders()
    if (token) {
        headers.set("Authorization", token)
    }
    // @ts-expect-error
    const fetchUrl = `${import.meta.env.VITE_BACKEND_URL}${path}`
    return await axios.get(fetchUrl, { params, headers })
}
