import { useMeQuery } from "../../hooks/useMeQuery.ts"
import { AvatarSkeleton } from "./AvatarSkeleton.tsx"
import { Avatar } from "./Avatar.tsx"

export const MeAvatar = () => {
    const { user, error } = useMeQuery()
    console.log(error)
    if (!user || error) {
        return <AvatarSkeleton />
    }

    return <Avatar avatarUser={user} />
}
