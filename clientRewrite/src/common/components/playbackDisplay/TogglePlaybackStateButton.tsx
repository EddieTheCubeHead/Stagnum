import { IconButton } from "../../icons/IconButton.tsx"
import { PauseIconSvg } from "../../icons/svgs/PauseIconSvg.tsx"
import { usePoolStore } from "../../stores/poolStore.ts"
import { PlayIconSvg } from "../../icons/svgs/PlayIconSvg.tsx"
import { usePostPausePlayback } from "../../hooks/usePostPausePlayback.ts"
import { usePostResumePlayback } from "../../hooks/usePostResumePlayback.ts"

export const TogglePlaybackStateButton = () => {
    const { pool } = usePoolStore()
    const postPausePlayback = usePostPausePlayback()
    const postResumePlayback = usePostResumePlayback()
    return (
        <>
            {pool?.is_active ? (
                <IconButton onClick={postPausePlayback} svg={<PauseIconSvg />} />
            ) : (
                <IconButton onClick={postResumePlayback} svg={<PlayIconSvg />} />
            )}
        </>
    )
}
