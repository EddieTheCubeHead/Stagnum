import { PoolTopBar } from "../components/poolTopBar/PoolTopBar.tsx"
import { usePoolStore } from "../../common/stores/poolStore.ts"
import { PoolMemberCard } from "../components/PoolMemberCard.tsx"
import { PoolCollectionSection } from "../components/PoolCollectionSection.tsx"
import { useLocation } from "@tanstack/react-router"

export const Pool = () => {
    const { pool } = usePoolStore()
    const isSearchOpen = useLocation({ select: (location) => location.pathname.includes("search") })
    return (
        <div
            className={`flex-grow max-w-full basis-1/3 ${isSearchOpen && "max-lg:hidden lg:mr-1"} h-[calc(100vh-3rem)] overflow-y-auto space-y-2`}
        >
            <PoolTopBar />
            <div className="grow pb-4 px-2 space-y-1">
                {pool?.users.map((user) => (
                    <div key={user.user.spotify_id} className="space-y-1">
                        {user.tracks.map((track) => (
                            <PoolMemberCard key={track.spotify_resource_uri} poolMember={track} isTopLevel={true} />
                        ))}
                        {user.collections.map((collection) => (
                            <PoolCollectionSection key={collection.spotify_resource_uri} collection={collection} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}
