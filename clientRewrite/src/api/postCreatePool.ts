import { post } from "./methods.ts"

export const postCreatePool = async (resourceUri: string, token: string) => {
    const postData = {
        spotify_uris: [
            {
                spotify_uri: resourceUri,
            },
        ],
    }

    const poolData = await post("/pool", postData, token)
    return poolData.data
}
