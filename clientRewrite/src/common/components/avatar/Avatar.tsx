import { useUserStore } from "../../stores/userStore.ts"
import { AvatarImage } from "./AvatarImage.tsx"
import { NamePlaceholder } from "./NamePlaceholder.tsx"

export const Avatar = () => {
    const { icon_url, display_name } = useUserStore().user ?? { icon_url: null, display_name: "?" }
    return icon_url ? (
        <AvatarImage imageUrl={icon_url} userName={display_name} />
    ) : (
        <NamePlaceholder userName={display_name} />
    )
}
