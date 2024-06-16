export function MainLogo() {
    return (
        <div className="flex text-center space-x-1">
            <img alt="The Stagnum application logo" src={"/logo.png"} className="w-iconSize h-iconSize" />
            <h1 className="pointer-events-none text-4xl font-semibold">Stagnum</h1>
        </div>
    )
}
