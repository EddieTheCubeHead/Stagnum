import { AvatarSkeleton } from "../../../common/components/avatar/AvatarSkeleton.tsx"

export const PoolTopBarPoolOwnerSkeleton = () => {
    return (
        <>
            <AvatarSkeleton />
            <div className="flex-col space-y-1">
                <div className="bg-elementBackground-3 rounded-full w-16 h-2 animate-pulse" />
                <div className="bg-elementBackground-3 rounded-full w-16 h-3 animate-pulse" />
            </div>
        </>
    )
}
