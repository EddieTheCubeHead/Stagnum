import { apiGet } from "./methods.ts"
import { SpotifyToken } from "../login/models/SpotifyToken.ts"
import { LOCALSTORAGE_TOKEN_KEY } from "../common/constants/localStorage.ts"

export const fetchToken = async (code?: string, state?: string): Promise<SpotifyToken | null> => {
    const localToken = localStorage.getItem(LOCALSTORAGE_TOKEN_KEY)
    if (localToken) {
        return { access_token: localToken }
    }
    if (!state || !code) {
        return null
    }
    const client_redirect_uri = import.meta.env.VITE_FRONTEND_URL
    const tokenData = await apiGet<SpotifyToken>("/auth/login/callback", undefined, {
        code,
        state,
        client_redirect_uri,
    })
    if (tokenData.data.access_token) {
        localStorage.setItem(LOCALSTORAGE_TOKEN_KEY, tokenData.data.access_token)
    }
    return tokenData.data
}
