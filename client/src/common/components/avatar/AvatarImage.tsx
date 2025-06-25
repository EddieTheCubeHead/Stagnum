import { Size } from "../../constants/size.ts"

interface AvatarImageProps {
    imageUrl: string
    userName: string
    size?: Size.md | Size.xs
}

export const AvatarImage = ({ imageUrl, userName, size }: AvatarImageProps) => {
    const sizeString = size === Size.xs ? "size-4" : "size-iconSize"
    return (
        <img
            className={`${sizeString} rounded-full object-cover`}
            src={imageUrl}
            alt={`User ${userName} avatar`}
            title={`User ${userName} avatar`}
        />
    )
}
