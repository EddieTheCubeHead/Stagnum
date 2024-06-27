import { SearchIconSvg } from "../../../icons/svgs/SearchIconSvg.tsx"
import { useSearchStore } from "../../../stores/searchStore.ts"
import { ToolBarHighlightedButton } from "../ToolBarHighlightedButton.tsx"

export const ToolBarSearchOpenButton = () => {
    const searchStore = useSearchStore()
    return <ToolBarHighlightedButton onClick={() => searchStore.setIsOpened(true)} svg={<SearchIconSvg />} />
}
