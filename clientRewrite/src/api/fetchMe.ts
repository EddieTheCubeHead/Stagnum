import { apiGet } from "./methods.ts"

export const fetchMe = async (token: string | null) => {
    if (!token) {
        return null
    }
    const me = await apiGet("/me", token)
    return me.data
}
