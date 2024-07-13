import { PoolMember } from "../../common/models/PoolMember.ts"
import { IconButton } from "../../common/icons/IconButton.tsx"
import { StarIconSvg } from "../../common/icons/svgs/StarIconSvg.tsx"
import { usePostPromoteTrack } from "../../common/hooks/usePostPromoteTrack.ts"
import { usePoolPromotedSongs } from "../../common/hooks/usePoolPromotedSongs.ts"
import { Avatar } from "../../common/components/avatar/Avatar.tsx"
import { Size } from "../../common/constants/size.ts"

interface PromotePoolTrackIconButtonProps {
    poolMember: PoolMember
}

export const PromotePoolTrackIconButton = ({ poolMember }: PromotePoolTrackIconButtonProps) => {
    const promotePoolMember = usePostPromoteTrack(poolMember)
    const promotedPoolMembers = usePoolPromotedSongs()
    const promotedByUser = promotedPoolMembers.get(poolMember.id)
    return (
        <div className="relative">
            {poolMember.spotify_resource_uri.startsWith("spotify:track:") && (
                <>
                    <IconButton svg={<StarIconSvg />} onClick={promotePoolMember} toggled={!!promotedByUser} />
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
