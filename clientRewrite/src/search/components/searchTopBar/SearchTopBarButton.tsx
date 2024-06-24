import { IconButton } from "../../../common/icons/IconButton.tsx"
import { ReactNode } from "react"

interface SearchTopBarButtonProps {
    title: string
    svg: ReactNode
    focusMethod: () => void
    isFocused: boolean
}

export const SearchTopBarButton = ({ title, svg, focusMethod, isFocused }: SearchTopBarButtonProps) => {
    return (
        <div className="flex-initial w-24 flex justify-center">
            <IconButton
                svg={svg}
                onClick={() => {
                    focusMethod()
                }}
                title={title}
                toggled={isFocused}
            />
        </div>
    )
}
