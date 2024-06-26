import { ToolBarSearch } from "./toolbarSearch/ToolBarSearch.tsx"
import { Icon } from "../../icons/Icon.tsx"
import { HomeIconSvg } from "../../icons/svgs/HomeIconSvg.tsx"
import { DeletePoolIconSvg } from "../../icons/svgs/DeletePoolIconSvg.tsx"
import { Size } from "../../constants/size.ts"
import { IconButton } from "../../icons/IconButton.tsx"
import { useSearchStore } from "../../stores/searchStore.ts"
import { usePoolStore } from "../../stores/poolStore.ts"

export const ToolBar = () => {
    const { isOpened, clearQuery } = useSearchStore()
    const { pool } = usePoolStore()
    return (
        <div className="select-none w-full justify-center items-center p-8 fixed bottom-0 flex z-30 pointer-events-none">
            <div className="flex items-center pointer-events-auto">
                <IconButton svg={<HomeIconSvg />} size={Size.l} onClick={() => clearQuery()} />
                <ToolBarSearch />
                {!isOpened &&
                    (pool ? (
                        <IconButton svg={<DeletePoolIconSvg />} size={Size.l} onClick={() => {}} />
                    ) : (
                        <Icon svg={<DeletePoolIconSvg />} size={Size.l} />
                    ))}
            </div>
        </div>
    )
}
