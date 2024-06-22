import { ToolBarSearch } from "./toolbarSearch/ToolBarSearch.tsx"

export const ToolBar = () => {
    return (
        <div className="select-none w-full justify-center items-center p-8 fixed bottom-0 flex z-30">
            <div className="flex items-center">
                <ToolBarSearch />
            </div>
        </div>
    )
}
