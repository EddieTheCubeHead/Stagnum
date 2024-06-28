import { ToolBarOpenedField } from "./ToolBarOpenedField.tsx"
import { useJoinPool } from "../../../pool/hooks/useJoinPool.ts"
import { JoinPoolIconSvg } from "../../icons/svgs/JoinPoolIconSvg.tsx"
import { useState } from "react"
import { IconButton } from "../../icons/IconButton.tsx"
import { PasteIconSvg } from "../../icons/svgs/PasteIconSvg.tsx"

export const ToolBarExpandedJoinPoolField = () => {
    const [joinCode, setJoinCode] = useState("")
    const joinPoolCallback = useJoinPool(joinCode)
    return (
        <ToolBarOpenedField
            action={
                <>
                    <IconButton
                        onClick={async () => setJoinCode(await navigator.clipboard.readText())}
                        svg={<PasteIconSvg />}
                    />
                    <input
                        type="text"
                        className="placeholder-clickable text-stroke text-xs !outline-0 !ring-0 !border-none bg-transparent min-w-0 grow"
                        placeholder="Pool code..."
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        onSubmit={joinPoolCallback}
                    ></input>
                </>
            }
            onClick={joinPoolCallback}
            svg={<JoinPoolIconSvg />}
        />
    )
}
