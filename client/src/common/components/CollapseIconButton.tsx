import { IconButton } from "../icons/IconButton.tsx"
import { CollapseIconSvg } from "../icons/svgs/CollapseIconSvg.tsx"
import { OpenIconSvg } from "../icons/svgs/OpenIconSvg.tsx"

interface CollapseIconButtonProps {
    open: boolean
    setOpen: (collapsed: boolean) => void
    category?: string
}

export const CollapseIconButton = ({ open, setOpen, category }: CollapseIconButtonProps) => {
    return (
        <>
            {open ? (
                <IconButton
                    svg={<CollapseIconSvg label={`Collapse${category ? ` ${category}` : ""}`} />}
                    onClick={() => setOpen(false)}
                />
            ) : (
                <IconButton
                    svg={<OpenIconSvg label={`Open${category ? ` ${category}` : ""}`} />}
                    onClick={() => setOpen(true)}
                />
            )}
        </>
    )
}
