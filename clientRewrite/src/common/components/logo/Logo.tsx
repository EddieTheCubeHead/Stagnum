import { Size } from "../../constants/size.ts"
import { LogoIcon } from "./LogoIcon.tsx"
import { LogoText } from "./LogoText.tsx"

interface LogoProps {
    size: Size.md | Size.l
}

export function Logo({ size }: LogoProps) {
    return (
        <div className="flex text-center space-x-1">
            <LogoIcon size={size} />
            <LogoText size={size} />
        </div>
    )
}
