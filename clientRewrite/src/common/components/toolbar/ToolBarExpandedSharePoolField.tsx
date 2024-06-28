import { ToolBarOpenedField } from "./ToolBarOpenedField.tsx"
import { SharePoolIconSvg } from "../../icons/svgs/SharePoolIconSvg.tsx"
import { SharePool } from "../../../pool/components/SharePool.tsx"

export const ToolBarExpandedSharePoolField = () => {
    return <ToolBarOpenedField onClick={() => {}} svg={<SharePoolIconSvg />} action={<SharePool />} />
}
