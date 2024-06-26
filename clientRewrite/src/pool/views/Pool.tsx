import { PoolTopBar } from "../components/poolTopBar/PoolTopBar.tsx"
import { usePoolStore } from "../../common/stores/poolStore.ts"
import { PoolMemberCard } from "../components/PoolMemberCard.tsx"
import { useSearchStore } from "../../common/stores/searchStore.ts"
import { PoolCollectionSection } from "../components/PoolCollectionSection.tsx"

export const Pool = () => {
    const { pool } = usePoolStore()
    const isSearchOpen = useSearchStore().query !== ""
    return (
        <div
            className={`flex-grow max-w-full basis-1/3 ${isSearchOpen && "max-lg:hidden"} h-[calc(100vh-3rem)] overflow-y-auto space-y-2`}
        >
            <PoolTopBar />
            <div className="grow pb-4 px-2 ">
                {pool?.users.map((user) => (
                    <>
                        {user.tracks.map((track) => (
                            <PoolMemberCard key={track.spotify_track_uri} poolMember={track} />
                        ))}
                        {user.collections.map((collection) => (
                            <PoolCollectionSection collection={collection} />
                        ))}
                    </>
                ))}
            </div>
        </div>
    )
}
