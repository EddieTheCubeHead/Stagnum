import { useMemo } from "react"
import { Size } from "../../constants/size.ts"

interface NamePlaceholderProps {
    userName: string | undefined
    size?: Size.md | Size.xs
}

export const NamePlaceholder = ({ userName, size }: NamePlaceholderProps) => {
    // Should be maybe calculated from username hash?
    // Still changes randomly on reload, will be fixed later
    const randomColor = useMemo(() => Math.floor(Math.random() * 6), [])
    const colorClasses = [
        { bg: "bg-avatar-1-bg", text: "text-avatar-1-text" },
        { bg: "bg-avatar-2-bg", text: "text-avatar-2-text" },
        { bg: "bg-avatar-3-bg", text: "text-avatar-3-text" },
        { bg: "bg-avatar-4-bg", text: "text-avatar-4-text" },
        { bg: "bg-avatar-5-bg", text: "text-avatar-5-text" },
        { bg: "bg-avatar-6-bg", text: "text-avatar-6-text" },
    ]
    const color = colorClasses[randomColor]
    const displayName = userName ?? "?"
    const sizeString = size === Size.xs ? "size-4" : "size-iconSize"
    return (
        <div
            className={`relative inline-flex items-center justify-center ${sizeString} overflow-hidden ${color.bg} rounded-full`}
        >
            <span className={`font-semibold ${color.text}`}>{displayName.toUpperCase().charAt(0)}</span>
        </div>
    )
}
