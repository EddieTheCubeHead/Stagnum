import { AvatarImage } from "./AvatarImage.tsx"
import { NamePlaceholder } from "./NamePlaceholder.tsx"
import { useMeQuery } from "../../hooks/useMeQuery.ts"

export const Avatar = () => {
    const user = useMeQuery()
    return user && user.icon_url ? (
        <AvatarImage imageUrl={user.icon_url} userName={user.display_name} />
    ) : (
        <NamePlaceholder userName={user?.display_name} />
    )
}
