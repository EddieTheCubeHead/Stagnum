import { CardBase } from "../../../common/components/cards/CardBase.tsx"
import { ReactNode } from "react"
import { Icon } from "../../../common/icons/Icon.tsx"
import { CollapseIconButton } from "../../../common/components/CollapseIconButton.tsx"

interface SearchCategoryTitleCardProps {
    title: string
    iconSvg: ReactNode
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
}

export const SearchCategoryTitleCard = ({ title, iconSvg, isOpen, setIsOpen }: SearchCategoryTitleCardProps) => {
    return (
        <CardBase>
            <CollapseIconButton open={isOpen} setOpen={setIsOpen} />
            <Icon svg={iconSvg} />
            <h3 className="font-semibold text-lg">{title}</h3>
        </CardBase>
    )
}
