import { get } from "./methods.ts"

export const fetchMe = async (token: string | null) => {
    if (!token) {
        return null
    }
    const me = await get("/me", token)
    return me.data
}
