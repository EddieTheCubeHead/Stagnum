import { useUserStore } from "../../stores/userStore.ts"
import { AvatarImage } from "./AvatarImage.tsx"
import { NamePlaceholder } from "./NamePlaceholder.tsx"

export const Avatar = () => {
    const user = useUserStore((state) => state.user)
    return user && user.icon_url ? (
        <AvatarImage imageUrl={user.icon_url} userName={user.display_name} />
    ) : (
        <NamePlaceholder userName={user?.display_name} />
    )
}
