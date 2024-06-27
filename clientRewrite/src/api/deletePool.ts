import { apiDelete } from "./methods.ts"

export const deletePool = async (token: string) => {
    const poolData = await apiDelete("/pool", token)
    return poolData.data
}
