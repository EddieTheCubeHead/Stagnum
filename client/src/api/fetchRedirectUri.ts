import { apiGet } from "./methods.ts"
import { RedirectResponse } from "../login/models/RedirectResponse.ts"

export const fetchRedirectUri = async () => {
    const client_redirect_uri = import.meta.env.VITE_FRONTEND_URL
    const response = await apiGet<RedirectResponse>("/auth/login", undefined, { client_redirect_uri })
    return response.data
}
