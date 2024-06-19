import { get } from "./methods.ts"

export const fetchToken = async (code: string, state: string) => {
    // @ts-expect-error
    const client_redirect_uri = import.meta.env.VITE_FRONTEND_URL
    const tokenData = await get("/auth/login/callback", undefined, { code, state, client_redirect_uri })
    return tokenData.data
}
