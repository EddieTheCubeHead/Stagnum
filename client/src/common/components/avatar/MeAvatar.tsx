import { useMeQuery } from "../../hooks/useMeQuery.ts"
import { AvatarSkeleton } from "./AvatarSkeleton.tsx"
import { Avatar } from "./Avatar.tsx"
import { useTokenQuery } from "../../hooks/useTokenQuery.ts"

export const MeAvatar = () => {
    const { user, error } = useMeQuery()
    const { token } = useTokenQuery()
    if (!user || error || !token) {
        return <AvatarSkeleton />
    }

    return <Avatar avatarUser={user} />
}
