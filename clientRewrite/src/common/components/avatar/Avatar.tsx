import { AvatarImage } from "./AvatarImage.tsx"
import { NamePlaceholder } from "./NamePlaceholder.tsx"
import { User } from "../../models/User.ts"

interface AvatarProps {
    avatarUser: User
}

export const Avatar = ({ avatarUser }: AvatarProps) => {
    return avatarUser.icon_url ? (
        <AvatarImage imageUrl={avatarUser.icon_url} userName={avatarUser.display_name} />
    ) : (
        <NamePlaceholder userName={avatarUser?.display_name} />
    )
}
