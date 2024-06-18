import axios from "axios"

export const fetchRedirectUri = async () => {
    const fetchUrl = `${import.meta.env.VITE_BACKEND_URL}/auth/login`
    const client_redirect_uri = import.meta.env.VITE_FRONTEND_URL
    const response = await axios.get(fetchUrl, { params: { client_redirect_uri } })
    return response.data
}
