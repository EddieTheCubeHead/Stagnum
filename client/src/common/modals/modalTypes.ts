import { PlayableSpotifyResource } from "../../search/models/PlayableSpotifyResource.ts"
import { z } from "zod"

const PlayableSpotifyResourceSchema: z.ZodType<PlayableSpotifyResource> = z.object({
    uri: z.string(),
    name: z.string(),
    link: z.string(),
})

export const ModalSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("ConfirmPoolOverwrite"),
        props: z.object({ newPoolResource: PlayableSpotifyResourceSchema }),
    }),
    z.object({ type: z.literal("ConfirmLeavePool") }),
    z.object({ type: z.literal("ConfirmDeletePool") }),
])
