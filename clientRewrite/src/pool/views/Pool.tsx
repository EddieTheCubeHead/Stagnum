import { PoolTopBar } from "../components/PoolTopBar.tsx"
import { usePoolStore } from "../../common/stores/poolStore.ts"
import { PoolMemberCard } from "../components/cards/PoolMemberCard.tsx"
import { useSearchStore } from "../../common/stores/searchStore.ts"

export const Pool = () => {
    const { pool } = usePoolStore()
    const isSearchOpen = useSearchStore().query !== ""
    return (
        <div
            className={`flex-grow max-w-full basis-1/3 ${isSearchOpen && "max-lg:hidden"} h-[calc(100vh-3rem)] overflow-y-auto space-y-2`}
        >
            <PoolTopBar />
            <div className="grow space-y-1 pb-4 px-2 ">
                {pool?.users.map((user) => (
                    <>
                        {user.tracks.map((track) => (
                            <PoolMemberCard key={track.spotify_track_uri} poolMember={track} />
                        ))}
                        {user.collections.map((collection) => (
                            <>
                                <PoolMemberCard poolMember={collection} />
                                <div className="flex-col space-y-1 pl-10 pr-1 pt-1">
                                    {collection.tracks.map((track) => (
                                        <PoolMemberCard key={track.spotify_track_uri} poolMember={track} />
                                    ))}
                                </div>
                            </>
                        ))}
                    </>
                ))}
            </div>
        </div>
    )
}
