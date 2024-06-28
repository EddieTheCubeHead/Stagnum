export const SharePoolSkeleton = () => {
    return (
        <div className="grow flex items-center space-x-2">
            <span className="bg-clickable/30 size-5 rounded-full animate-pulse" />
            <span className="bg-clickable/30 h-4 grow rounded-full animate-pulse" />
            <span className="w-0" />
        </div>
    )
}
