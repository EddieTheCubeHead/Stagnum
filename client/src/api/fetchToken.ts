import { rawApiGet } from "./methods.ts"
import { SpotifyToken } from "../login/models/SpotifyToken.ts"
import { LOCALSTORAGE_TOKEN_KEY } from "../common/constants/localStorage.ts"
import { REDIRECT_URI } from "../common/constants/uris.ts"

export const fetchToken = async (code: string, state: string): Promise<SpotifyToken | null> => {
    const localToken = localStorage.getItem(LOCALSTORAGE_TOKEN_KEY)
    if (localToken) {
        return { access_token: localToken }
    }
    const client_redirect_uri = REDIRECT_URI
    const tokenData = await rawApiGet<SpotifyToken>("/auth/login/callback", {
        code,
        state,
        client_redirect_uri,
    })
    if (tokenData.data.access_token) {
        localStorage.setItem(LOCALSTORAGE_TOKEN_KEY, tokenData.data.access_token)
    }
    return tokenData.data
}
