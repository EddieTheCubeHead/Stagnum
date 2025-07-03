import { ToolBarOpenedField } from "./ToolBarOpenedField.tsx"
import { SharePoolIconSvg } from "../../common/icons/svgs/SharePoolIconSvg.tsx"
import { SharePool } from "../../pool/components/SharePool.tsx"

export const ToolBarExpandedSharePoolField = () => {
    return <ToolBarOpenedField onClick={() => {}} svg={<SharePoolIconSvg />} action={<SharePool />} />
}
