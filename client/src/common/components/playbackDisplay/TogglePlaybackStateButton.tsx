import { IconButton } from "../../icons/IconButton.tsx"
import { PauseIconSvg } from "../../icons/svgs/PauseIconSvg.tsx"
import { usePoolStore } from "../../stores/poolStore.ts"
import { PlayIconSvg } from "../../icons/svgs/PlayIconSvg.tsx"
import { usePostPausePlayback } from "../../hooks/usePostPausePlayback.ts"
import { usePostResumePlayback } from "../../hooks/usePostResumePlayback.ts"
import { useMutatePool } from "../../../pool/hooks/useMutatePool.ts"
import { useMeQuery } from "../../hooks/useMeQuery.ts"

const PAUSE_MUTATION = "pause"
const RESUME_MUTATION = "resume"

export const TogglePlaybackStateButton = () => {
    const { pool } = usePoolStore()
    const { user } = useMeQuery()
    const isOwnPool = pool?.owner.spotify_id === user?.spotify_id
    const postPausePlayback = usePostPausePlayback()
    const postResumePlayback = usePostResumePlayback()
    const pauseMutation = useMutatePool({ mutationFn: postPausePlayback, mutationKey: [PAUSE_MUTATION] })
    const resumeMutation = useMutatePool({ mutationFn: postResumePlayback, mutationKey: [RESUME_MUTATION] })
    return (
        <>
            {pool?.is_active ? (
                <IconButton
                    onClick={() => pauseMutation.mutate(undefined)}
                    svg={<PauseIconSvg />}
                    disabled={!isOwnPool}
                />
            ) : (
                <IconButton
                    onClick={() => resumeMutation.mutate(undefined)}
                    svg={<PlayIconSvg />}
                    disabled={!isOwnPool}
                />
            )}
        </>
    )
}
