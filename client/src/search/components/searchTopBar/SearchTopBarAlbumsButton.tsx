import { SearchTopBarButton } from "./SearchTopBarButton.tsx"
import { AlbumIconSvg } from "../../../common/icons/svgs/AlbumIconSvg.tsx"
import { useSearchStates } from "../../hooks/useSearchStates.ts"

export const SearchTopBarAlbumsButton = () => {
    const { toggleTopBar, onlyAlbumsOpen } = useSearchStates()
    return (
        <SearchTopBarButton
            title="Albums"
            svg={<AlbumIconSvg />}
            focusMethod={() => toggleTopBar("albums")}
            isFocused={onlyAlbumsOpen}
        />
    )
}
