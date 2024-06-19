import { Size } from "../../constants/size.ts"

interface LogoTextProps {
    size: Size.md | Size.l
}

export function LogoText({ size }: LogoTextProps) {
    const textSize = size > Size.md ? "text-4xl" : "text-3xl"
    return <h1 className={`pointer-events-none ${textSize} font-semibold`}>Stagnum</h1>
}
