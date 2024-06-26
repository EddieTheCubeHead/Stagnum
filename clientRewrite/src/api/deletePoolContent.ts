import { apiDelete } from "./methods.ts"

export const deletePoolContent = async (resourceUri: string, token: string) => {
    const poolData = await apiDelete(`/pool/content/${resourceUri}`, token)
    return poolData.data
}
