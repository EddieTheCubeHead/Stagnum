export function MainLogo() {
    return (
        <div className="flex w-full text-center space-x-1">
            <img
                alt="The Stagnum application logo"
                src={"../../../../public/logo.png"}
                className="w-iconSize h-iconSize"
            />
            <div className="text-4xl font-semibold">Stagnum</div>
        </div>
    )
}
