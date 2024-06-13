import { ReactNode } from "react"
import { MainLogo } from "../../common/components/MainLogo.tsx"

export const LoginPopup = () => {
    return (
        <BackgroundBlur>
            <LoginPopupCard />
        </BackgroundBlur>
    )
}

interface BackgroundBlurProps {
    children?: ReactNode
}

const BackgroundBlur = ({ children }: BackgroundBlurProps) => {
    return (
        <div className="h-screen w-screen backdrop-blur-sm z-40 top-0 absolute flex items-center justify-center">
            {children}
        </div>
    )
}

const LoginPopupCard = () => {
    return (
        <div className="rounded-3xl w-64 md:w-128 lg:w-192 h-64 md:h-96 lg:h-128 bg-elementBackground-1 border-accent border-2 drop-shadow-2xl flex items-center justify-center">
            <LoginPrompt />
            <BackgroundImage />
        </div>
    )
}

const LoginPrompt = () => {
    return (
        <div className="w-full flex-col space-y-3 md:space-y-8">
            <MainLogoWithSpotifyLogo />
            <div className="w-full text-center px-3 md:px-6 lg:px-20">
                <p className="pointer-events-none">Please log in with your Spotify account</p>
            </div>
        </div>
    )
}

const MainLogoWithSpotifyLogo = () => {
    return (
        <div className="w-full flex justify-center">
            <div className="flex-col">
                <div className="flex justify-center space-x-1 relative -right-12 -bottom-2">
                    <p className="-bottom-1 relative text-lg flex-none pointer-events-none">For</p>
                    <img
                        src="../../../public/Spotify_Logo_RGB_Green.png"
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

function BackgroundImage() {
    return (
        // Force width usage with invisible div
        <>
            <div className="w-full max-md:hidden"></div>
            <img
                className="w-3/5 max-md:hidden object-scale-down bottom-0 right-0 absolute"
                alt="Login background image"
                src="../../../public/LoginBGDark.png"
            />
        </>
    )
}
