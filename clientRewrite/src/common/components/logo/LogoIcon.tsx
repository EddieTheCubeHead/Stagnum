import { Size } from "../../constants/size.ts"

interface LogoIconProps {
    size: Size.md | Size.l
}

export function LogoIcon({ size }: LogoIconProps) {
    const className = size > Size.md ? "w-bigIconSize h-bigIconSize" : "w-iconSize h-iconSize"
    return <img alt="The Stagnum application logo" src={"/logo.png"} className={className} />
}
