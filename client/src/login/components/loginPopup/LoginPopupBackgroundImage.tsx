import { useThemeStore } from "../../../common/stores/themeStore.ts"

export const LoginPopupBackgroundImage = () => {
    const { theme } = useThemeStore()
    const capitalizedTheme = theme.charAt(0).toUpperCase() + theme.slice(1)
    return (
        // Force width usage with invisible div
        <>
            <div className="w-full max-md:hidden"></div>
            <img
                className="w-3/5 max-md:hidden object-scale-down bottom-0 right-0 absolute"
                alt={`${capitalizedTheme} theme login background image`}
                src={`/LoginBG${capitalizedTheme}.png`}
            />
        </>
    )
}
