import { ToolBarOpenedField } from "./ToolBarOpenedField.tsx"
import { useJoinPool } from "../../pool/hooks/useJoinPool.ts"
import { JoinPoolIconSvg } from "../../common/icons/svgs/JoinPoolIconSvg.tsx"
import { useState } from "react"
import { IconButton } from "../../common/icons/IconButton.tsx"
import { PasteIconSvg } from "../../common/icons/svgs/PasteIconSvg.tsx"
import { useMutatePool } from "../../pool/hooks/useMutatePool.ts"

interface ToolBarExpandedJoinPoolFieldProps {
    resetState: () => void
}

const JOIN_MUTATION = "join"

export const ToolBarExpandedJoinPoolField = ({ resetState }: ToolBarExpandedJoinPoolFieldProps) => {
    const [joinCode, setJoinCode] = useState("")
    const joinPoolCallback = useJoinPool(joinCode)
    const { mutate } = useMutatePool({ mutationFn: joinPoolCallback, mutationKey: [JOIN_MUTATION] })
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
                        placeholder="Pool code"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        onSubmit={() => mutate(undefined)}
                    ></input>
                </>
            }
            resetState={resetState}
            onClick={() => mutate(undefined)}
            svg={<JoinPoolIconSvg />}
        />
    )
}
