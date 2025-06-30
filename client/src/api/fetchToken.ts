import { apiGet } from "./methods.ts"
import { SpotifyToken } from "../login/models/SpotifyToken.ts"

export const fetchToken = async (code: string, state: string) => {
    const client_redirect_uri = import.meta.env.VITE_FRONTEND_URL
    const tokenData = await apiGet<SpotifyToken>("/auth/login/callback", undefined, {
        code,
        state,
        client_redirect_uri,
    })
    return tokenData.data
}
