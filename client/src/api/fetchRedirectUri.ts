import { rawApiGet } from "./methods.ts"
import { RedirectResponse } from "../login/models/RedirectResponse.ts"
import { REDIRECT_URI } from "../common/constants/uris.ts"

export const fetchRedirectUri = async () => {
    const client_redirect_uri = REDIRECT_URI
    const response = await rawApiGet<RedirectResponse>("/auth/login", { client_redirect_uri })
    return response.data
}
