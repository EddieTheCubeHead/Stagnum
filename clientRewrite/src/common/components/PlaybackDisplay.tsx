import { usePoolStore } from "../stores/poolStore.ts"
import { CardText } from "./cards/CardText.tsx"
import { Size } from "../constants/size.ts"
import { SkipIconSvg } from "../icons/svgs/SkipIconSvg.tsx"
import { IconButton } from "../icons/IconButton.tsx"
import { useSkipCallback } from "../hooks/useSkipCallback.ts"
import { useCallback } from "react"

export const PlaybackDisplay = () => {
    const { pool } = usePoolStore()
    const skipCallback = useCallback(useSkipCallback(), [pool])
    if (!pool?.currently_playing) {
        return null
    }
    return (
        <div className="min-w-56 max-w-96 h-bigCardHeight flex items-center grow bg-elementBackground-1 border-2 border-accent rounded-xl z-30 px-4 space-x-2 select-none pointer-events-auto">
            <img
                src={pool.currently_playing.spotify_icon_uri}
                alt={`Currently playing ${pool.currently_playing.name} icon`}
                className="h-iconSize w-iconSize pointer-events-none select-none"
            />
            <CardText size={Size.s} text={pool.currently_playing.name} title={pool.currently_playing.name} />
            <div className="grow" />
            <IconButton svg={<SkipIconSvg />} size={Size.md} onClick={() => skipCallback()} />
        </div>
    )
}
