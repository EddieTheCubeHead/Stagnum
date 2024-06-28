import { Icon, IconProps } from "./Icon.tsx"
import { Size } from "../constants/size.ts"

interface IconButtonProps extends IconProps {
    onClick: () => void
    title?: string
}

export const IconButton = ({ svg, onClick, title, toggled, size }: IconButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={`fill-clickable hover:fill-stroke group ${size === Size.l ? "size-12" : "size-8"} flex-col grow-0 shrink-0 justify-center items-center`}
        >
            <div className="flex justify-center items-center">
                <Icon svg={svg} button={true} toggled={toggled} size={size} />
            </div>

            {title && (
                <p
                    className={`select-none ${toggled ? "text-accent group-hover:text-accent-purple" : "text-clickable group-hover:text-stroke"} font-bold text-icon text-center`}
                >
                    {title}
                </p>
            )}
        </button>
    )
}
