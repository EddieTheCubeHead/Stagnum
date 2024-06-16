import { MainLogo } from "./MainLogo.tsx"

export const MainLogoWithSpotifyLogo = () => {
    return (
        <div className="w-full flex justify-center">
            <div className="flex-col">
                <div className="flex justify-center space-x-1 relative -right-12 -bottom-2">
                    <p className="-bottom-1 relative text-lg flex-none pointer-events-none">For</p>
                    <img
                        src="/Spotify_Logo_RGB_Green.png"
                        alt="Spotify logo"
                        className="object-scale-down w-1/4 flex-none"
                    />
                </div>
                <div className="flex justify-center">
                    <MainLogo />
                </div>
            </div>
        </div>
    )
}
