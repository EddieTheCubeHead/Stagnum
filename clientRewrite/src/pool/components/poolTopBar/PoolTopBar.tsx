import { SubviewTopBar } from "../../../common/components/SubviewTopBar.tsx"
import { PoolTopBarPoolOwner } from "./PoolTopBarPoolOwner.tsx"

export const PoolTopBar = () => {
    return (
        <SubviewTopBar>
            <PoolTopBarPoolOwner />
            <div className="grow" />
        </SubviewTopBar>
    )
}
