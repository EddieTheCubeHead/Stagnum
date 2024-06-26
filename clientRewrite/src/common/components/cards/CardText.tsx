import { Size } from "../../constants/size.ts"

interface CardTextProps {
    size: Size.xs | Size.s | Size.l
    text: string
    title: string
    link?: string
}

export const CardText = ({ size, text, link, title }: CardTextProps) => {
    let textSize = "text-xs min-w-0 max-w-44 truncate text-ellipsis"
    if (size === Size.xs) {
        textSize = "text-xxs font-extralight min-w-0 max-w-24 truncate text-ellipsis"
    } else if (size === Size.l) {
        textSize = "font-semibold text-lg min-w-0 max-w-44 truncate text-ellipsis"
    }
    if (link) {
        return (
            <a href={link} className={`text-text hover:underline ${textSize}`} title={title}>
                {text}
            </a>
        )
    }

    return (
        <p title={title} className={`text-text hover:underline ${textSize}`}>
            {text}
        </p>
    )
}
