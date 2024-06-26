import { apiPost } from "./methods.ts"

export const postAddToPool = async (resourceUri: string, token: string) => {
    const postData = {
        spotify_uri: resourceUri,
    }

    const poolData = await apiPost("/pool/content", postData, token)
    return poolData.data
}
