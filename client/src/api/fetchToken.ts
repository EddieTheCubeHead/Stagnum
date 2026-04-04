import { apiGet } from "./methods.ts"
import { SpotifyToken } from "../login/models/SpotifyToken.ts"
import { REDIRECT_URI } from "../common/constants/uris.ts"

export const fetchToken = async (code: string, state: string): Promise<SpotifyToken | null> => {
    const client_redirect_uri = REDIRECT_URI
    const tokenData = await apiGet<SpotifyToken>("/auth/login/callback", undefined, {
        code,
        state,
        client_redirect_uri,
    })
    return tokenData.data
}
