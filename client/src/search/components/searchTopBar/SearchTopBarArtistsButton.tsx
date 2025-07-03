import { SearchTopBarButton } from "./SearchTopBarButton.tsx"
import { ArtistIconSvg } from "../../../common/icons/svgs/ArtistIconSvg.tsx"
import { useSearchStates } from "../../hooks/useSearchStates.ts"

export const SearchTopBarArtistsButton = () => {
    const { toggleTopBar, onlyArtistsOpen } = useSearchStates()
    return (
        <SearchTopBarButton
            title="Artists"
            svg={<ArtistIconSvg />}
            focusMethod={() => toggleTopBar("artists")}
            isFocused={onlyArtistsOpen}
        />
    )
}
