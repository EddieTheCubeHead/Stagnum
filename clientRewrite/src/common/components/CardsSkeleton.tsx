export const CardsSkeleton = () => {
    return (
        <div className="max-w-full animate-pulse px-8 py-6 justify-center space-y-2 select-none">
            <div className="bg-elementBackground-2 rounded-full h-cardHeight w-full pointer-events-none"></div>
            <div className="bg-elementBackground-2/80 rounded-full h-cardHeight w-full pointer-events-none"></div>
            <div className="bg-elementBackground-2/60 rounded-full h-cardHeight w-full pointer-events-none"></div>
            <div className="bg-elementBackground-2/40 rounded-full h-cardHeight w-full pointer-events-none"></div>
            <div className="bg-elementBackground-2/20 rounded-full h-cardHeight w-full pointer-events-none"></div>
            <div className="bg-elementBackground-2/5 rounded-full h-cardHeight w-full pointer-events-none"></div>
        </div>
    )
}
