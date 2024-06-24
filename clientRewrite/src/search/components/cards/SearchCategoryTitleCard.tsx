import { CardBase } from "../../../common/components/cards/CardBase.tsx"
import { ReactNode } from "react"
import { CollapseIconSvg } from "../../../common/icons/svgs/CollapseIconSvg.tsx"
import { OpenIconSvg } from "../../../common/icons/svgs/OpenIconSvg.tsx"
import { Icon } from "../../../common/icons/Icon.tsx"
import { IconButton } from "../../../common/icons/IconButton.tsx"

interface SearchCategoryTitleCardProps {
    title: string
    iconSvg: ReactNode
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
}

export const SearchCategoryTitleCard = ({ title, iconSvg, isOpen, setIsOpen }: SearchCategoryTitleCardProps) => {
    return (
        <CardBase>
            {isOpen ? (
                <IconButton svg={<CollapseIconSvg />} onClick={() => setIsOpen(false)} />
            ) : (
                <IconButton svg={<OpenIconSvg />} onClick={() => setIsOpen(true)} />
            )}
            <Icon svg={iconSvg} />
            <h3 className="font-semibold text-lg">{title}</h3>
        </CardBase>
    )
}
