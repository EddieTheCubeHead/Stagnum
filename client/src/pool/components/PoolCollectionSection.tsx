import { PoolMemberCard } from "./PoolMemberCard.tsx"
import { PoolCollection } from "../../common/models/PoolCollection.ts"
import { useState } from "react"

interface PoolCollectionSectionProps {
    collection: PoolCollection
}

export const PoolCollectionSection = ({ collection }: PoolCollectionSectionProps) => {
    const [open, setOpen] = useState(false)
    return (
        <div>
            <PoolMemberCard poolMember={collection} parentProps={{ open, setOpen }} isTopLevel={true} />
            {open ? (
                <div className="flex-col space-y-1 pl-10 pr-1 pt-1">
                    {collection.tracks.map((track) => (
                        <PoolMemberCard key={track.spotify_resource_uri} poolMember={track} />
                    ))}
                </div>
            ) : (
                <div className="flex-col pl-10 pr-1 select-none">
                    <div className="bg-elementBackground-1 h-1 -top-2 rounded-b-md"></div>
                </div>
            )}
        </div>
    )
}
