import { usePoolStore } from "../../common/stores/poolStore.ts"
import { useApiPost } from "../../api/methods.ts"
import { useEffect } from "react"
import { SharePoolSkeleton } from "./SharePoolSkeleton.tsx"
import { IconButton } from "../../common/icons/IconButton.tsx"
import { CopyIconSvg } from "../../common/icons/svgs/CopyIconSvg.tsx"
import { Size } from "../../common/constants/size.ts"

export const SharePool = () => {
    const { pool, setPool } = usePoolStore()
    const sharePoolApiCall = useApiPost("/pool/share")

    useEffect(() => {
        if (!pool?.share_code) {
            sharePoolApiCall({}).then((poolModel) => setPool(poolModel))
        }
    })

    if (!pool?.share_code) {
        return <SharePoolSkeleton />
    }

    return (
        <div className="grow flex items-center space-x-1 ">
            <IconButton
                size={Size.md}
                onClick={() => navigator.clipboard.writeText(pool?.share_code!)}
                svg={<CopyIconSvg />}
            />
            <p
                title={pool.share_code}
                className={" text-center grow text-text text-xs min-w-0 truncate text-ellipsis select-all"}
            >
                {pool.share_code}
            </p>
        </div>
    )
}
