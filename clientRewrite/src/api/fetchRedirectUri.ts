import { get } from "./methods.ts"

export const fetchRedirectUri = async () => {
    const client_redirect_uri = import.meta.env.VITE_FRONTEND_URL
    const response = await get("/auth/login", undefined, { client_redirect_uri })
    return response.data
}
