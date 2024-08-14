import { PoolMember } from "../../common/models/PoolMember.ts"
import { IconButton } from "../../common/icons/IconButton.tsx"
import { StarIconSvg } from "../../common/icons/svgs/StarIconSvg.tsx"
import { usePostPromoteTrack } from "../../common/hooks/usePostPromoteTrack.ts"
import { usePoolPromotedSongs } from "../../common/hooks/usePoolPromotedSongs.ts"
import { Avatar } from "../../common/components/avatar/Avatar.tsx"
import { Size } from "../../common/constants/size.ts"
import { usePostDemoteTrack } from "../../common/hooks/usePostDemoteTrack.ts"
import { useMeQuery } from "../../common/hooks/useMeQuery.ts"

interface PromotePoolTrackIconButtonProps {
    poolMember: PoolMember
}

export const PromotePoolTrackIconButton = ({ poolMember }: PromotePoolTrackIconButtonProps) => {
    const promotePoolMember = usePostPromoteTrack(poolMember)
    const demotePoolMembers = usePostDemoteTrack(poolMember)
    const promotedPoolMembers = usePoolPromotedSongs()
    const promotedByUser = promotedPoolMembers.get(poolMember.id)
    const { user } = useMeQuery()
    const isPromotedBySelf = !!promotedByUser && promotedByUser?.spotify_id == user?.spotify_id
    const callback = isPromotedBySelf ? demotePoolMembers : promotePoolMember
    return (
        <div className="relative">
            {poolMember.spotify_resource_uri.startsWith("spotify:track:") && (
                <>
                    <IconButton svg={<StarIconSvg />} onClick={callback} toggled={!!promotedByUser} />
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
