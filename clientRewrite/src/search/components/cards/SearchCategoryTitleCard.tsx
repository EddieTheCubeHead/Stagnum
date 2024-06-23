import { CardBase } from "../../../common/components/cards/CardBase.tsx"
import { ReactNode } from "react"
import { Collapse } from "../../../common/icons/Collapse.tsx"
import { Open } from "../../../common/icons/Open.tsx"

interface SearchCategoryTitleCardProps {
    title: string
    icon: ReactNode
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
}

export const SearchCategoryTitleCard = ({ title, icon, isOpen, setIsOpen }: SearchCategoryTitleCardProps) => {
    return (
        <CardBase>
            <button onClick={() => setIsOpen(!isOpen)}>{isOpen ? <Collapse /> : <Open />}</button>
            {icon}
            <p className="font-semibold text-lg">{title}</p>
        </CardBase>
    )
}
