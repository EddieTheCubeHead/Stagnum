import { SubviewTopBar } from "../../common/components/SubviewTopBar.tsx"
import { usePoolStore } from "../../common/stores/poolStore.ts"

export const PoolTopBar = () => {
    const { pool } = usePoolStore()
    return <SubviewTopBar>{pool?.owner.display_name}</SubviewTopBar>
}
