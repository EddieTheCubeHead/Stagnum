import { useMeQuery } from "../../hooks/useMeQuery.ts"
import { AvatarSkeleton } from "./AvatarSkeleton.tsx"
import { Avatar } from "./Avatar.tsx"
import { useToken } from "../../../api/tokenHolder.ts"

export const MeAvatar = () => {
    const { user, error } = useMeQuery()
    const token = useToken()
    if (!user || error || !token) {
        return <AvatarSkeleton />
    }

    return <Avatar avatarUser={user} />
}
