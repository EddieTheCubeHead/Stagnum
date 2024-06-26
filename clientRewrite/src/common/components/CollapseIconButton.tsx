import { IconButton } from "../icons/IconButton.tsx"
import { CollapseIconSvg } from "../icons/svgs/CollapseIconSvg.tsx"
import { OpenIconSvg } from "../icons/svgs/OpenIconSvg.tsx"

interface CollapseIconButtonProps {
    open: boolean
    setOpen: (collapsed: boolean) => void
}

export const CollapseIconButton = ({ open, setOpen }: CollapseIconButtonProps) => {
    console.log(open)
    return (
        <>
            {open ? (
                <IconButton svg={<CollapseIconSvg />} onClick={() => setOpen(false)} />
            ) : (
                <IconButton svg={<OpenIconSvg />} onClick={() => setOpen(true)} />
            )}
        </>
    )
}
