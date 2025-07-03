import { SearchTopBarButton } from "./SearchTopBarButton.tsx"
import { TrackIconSvg } from "../../../common/icons/svgs/TrackIconSvg.tsx"
import { useSearchStates } from "../../hooks/useSearchStates.ts"

export const SearchTopBarTracksButton = () => {
    const { toggleTopBar, onlyTracksOpen } = useSearchStates()
    return (
        <SearchTopBarButton
            title="Tracks"
            svg={<TrackIconSvg />}
            focusMethod={() => toggleTopBar("tracks")}
            isFocused={onlyTracksOpen}
        />
    )
}
