import axios from "axios"

export const fetchToken = async (code: string, state: string) => {
    const fetchUrl = `${import.meta.env.VITE_BACKEND_URL}/auth/login/callback`
    const client_redirect_uri = import.meta.env.VITE_FRONTEND_URL
    const tokenData = await axios.get(fetchUrl, { params: { code, state, client_redirect_uri } })
    return tokenData.data
}
