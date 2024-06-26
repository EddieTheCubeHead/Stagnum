import axios, { AxiosHeaders } from "axios"

export const get = async (path: string, token?: string, params?: object) => {
    const headers = new AxiosHeaders()
    if (token) {
        headers.set("Authorization", token)
    }

    const fetchUrl = `${import.meta.env.VITE_BACKEND_URL}${path}`
    return await axios.get(fetchUrl, { params, headers })
}

export const post = async <T extends object>(path: string, body: T, token: string) => {
    const headers = new AxiosHeaders()
    headers.set("Authorization", token)
    const postUrl = `${import.meta.env.VITE_BACKEND_URL}${path}`
    return await axios.post(postUrl, body, { headers })
}
