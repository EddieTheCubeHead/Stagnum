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
        <div className="flex-initial flex justify-center grow min-w-0">
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
