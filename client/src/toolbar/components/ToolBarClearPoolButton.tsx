import { IconButton } from "../../common/icons/IconButton.tsx"
import { DeletePoolIconSvg } from "../../common/icons/svgs/DeletePoolIconSvg.tsx"
import { Size } from "../../common/constants/size.ts"
import { Icon } from "../../common/icons/Icon.tsx"
import { PoolState, usePoolStore } from "../../common/stores/poolStore.ts"
import { useMeQuery } from "../../common/hooks/useMeQuery.ts"
import { LeavePoolIconSvg } from "../../common/icons/svgs/LeavePoolIconSvg.tsx"

export const ToolBarClearPoolButton = () => {
    const { pool, setPoolState } = usePoolStore()
    const { user } = useMeQuery()
    return (
        <div className="grow">
            {pool ? (
                pool.owner.spotify_id == user?.spotify_id ? (
                    <IconButton
                        svg={<DeletePoolIconSvg />}
                        size={Size.l}
                        onClick={() => setPoolState(PoolState.Deleting)}
                    />
                ) : (
                    <IconButton
                        onClick={() => setPoolState(PoolState.Leaving)}
                        svg={<LeavePoolIconSvg />}
                        size={Size.l}
                    />
                )
            ) : (
                <div className="size-12 flex items-center justify-center">
                    <Icon svg={<DeletePoolIconSvg />} size={Size.l} />
                </div>
            )}
        </div>
    )
}
