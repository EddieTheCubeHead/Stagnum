import { ToolBarOpenedField } from "./ToolBarOpenedField.tsx"
import { SharePoolIconSvg } from "../../common/icons/svgs/SharePoolIconSvg.tsx"
import { SharePool } from "../../pool/components/SharePool.tsx"

interface ToolBarExpandedSharePoolFieldProps {
    resetState: () => void
}

export const ToolBarExpandedSharePoolField = ({ resetState }: ToolBarExpandedSharePoolFieldProps) => {
    return (
        <ToolBarOpenedField
            resetState={resetState}
            onClick={() => {}}
            svg={<SharePoolIconSvg />}
            action={<SharePool />}
        />
    )
}
