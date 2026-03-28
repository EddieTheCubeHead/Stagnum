import { PoolMember } from "../../common/models/PoolMember.ts"
import { IconButton } from "../../common/icons/IconButton.tsx"
import { StarIconSvg } from "../../common/icons/svgs/StarIconSvg.tsx"
import { usePostPromoteTrack } from "../../common/hooks/usePostPromoteTrack.ts"
import { usePoolPromotedSongs } from "../../common/hooks/usePoolPromotedSongs.ts"
import { Avatar } from "../../common/components/avatar/Avatar.tsx"
import { Size } from "../../common/constants/size.ts"
import { usePostDemoteTrack } from "../../common/hooks/usePostDemoteTrack.ts"
import { useMeQuery } from "../../common/hooks/useMeQuery.ts"
import { useMutatePool } from "../hooks/useMutatePool.ts"

interface PromotePoolTrackIconButtonProps {
    poolMember: PoolMember
}

const MUTATION_PROMOTE = "promote"
const MUTATION_DEMOTE = "demote"

export const PromotePoolTrackIconButton = ({ poolMember }: PromotePoolTrackIconButtonProps) => {
    const promotePoolMember = usePostPromoteTrack(poolMember)
    const demotePoolMember = usePostDemoteTrack(poolMember)
    const promoteMutation = useMutatePool({
        mutationFn: promotePoolMember,
        mutationKey: [MUTATION_PROMOTE, poolMember.id],
    })
    const demoteMutation = useMutatePool({
        mutationFn: demotePoolMember,
        mutationKey: [MUTATION_DEMOTE, poolMember.id],
    })
    const promotedPoolMembers = usePoolPromotedSongs()
    const promotedByUser = promotedPoolMembers.get(poolMember.id)
    const { user } = useMeQuery()
    const isPromotedBySelf = !!promotedByUser && promotedByUser?.spotify_id == user?.spotify_id
    const callback = isPromotedBySelf ? demoteMutation.mutate : promoteMutation.mutate
    return (
        <div className="relative">
            {poolMember.spotify_resource_uri.startsWith("spotify:track:") && (
                <>
                    <IconButton svg={<StarIconSvg />} onClick={() => callback(undefined)} toggled={!!promotedByUser} />
                    {promotedByUser && (
                        <span className="absolute bottom-0 right-0 z-10">
                            <Avatar avatarUser={promotedByUser} size={Size.xs} />
                        </span>
                    )}
                </>
            )}
        </div>
    )
}
