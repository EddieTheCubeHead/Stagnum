import { AvatarImage } from "./AvatarImage.tsx"
import { NamePlaceholder } from "./NamePlaceholder.tsx"
import { useMeQuery } from "../../hooks/useMeQuery.ts"
import { AvatarSkeleton } from "./AvatarSkeleton.tsx"

export const Avatar = () => {
    const { user, isLoading } = useMeQuery()
    if (isLoading || user === null) {
        return <AvatarSkeleton />
    }
    return user.icon_url ? (
        <AvatarImage imageUrl={user.icon_url} userName={user.display_name} />
    ) : (
        <NamePlaceholder userName={user?.display_name} />
    )
}
