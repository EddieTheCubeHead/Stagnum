import { AvatarImage } from "./AvatarImage.tsx"
import { NamePlaceholder } from "./NamePlaceholder.tsx"
import { User } from "../../models/User.ts"
import { Size } from "../../constants/size.ts"

interface AvatarProps {
    avatarUser: User
    size?: Size.md | Size.xs
}

export const Avatar = ({ avatarUser, size }: AvatarProps) => {
    return avatarUser.icon_url ? (
        <AvatarImage imageUrl={avatarUser.icon_url} userName={avatarUser.display_name} size={size} />
    ) : (
        <NamePlaceholder userName={avatarUser?.display_name} size={size} />
    )
}
