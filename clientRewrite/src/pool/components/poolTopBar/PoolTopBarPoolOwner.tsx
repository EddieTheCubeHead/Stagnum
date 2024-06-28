import { Avatar } from "../../../common/components/avatar/Avatar.tsx"
import { usePoolStore } from "../../../common/stores/poolStore.ts"
import { useMeQuery } from "../../../common/hooks/useMeQuery.ts"
import { PoolTopBarPoolOwnerSkeleton } from "./PoolTopBarPoolOwnerSkeleton.tsx"

export const PoolTopBarPoolOwner = () => {
    const { pool } = usePoolStore()
    const { user } = useMeQuery()

    if (!pool?.owner || !user) {
        return <PoolTopBarPoolOwnerSkeleton />
    }
    return (
        <>
            <Avatar avatarUser={pool?.owner ?? user} />
            <div className="flex-col text-xs select-none">
                <p className="flex text-xxs font-extralight">Pool owner</p>
                <p>{pool?.owner.spotify_id == user.spotify_id ? "You" : pool?.owner.display_name}</p>
            </div>
        </>
    )
}
