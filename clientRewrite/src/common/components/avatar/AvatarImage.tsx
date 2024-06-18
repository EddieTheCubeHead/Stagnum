interface AvatarImageProps {
    imageUrl: string
    userName: string
}

export const AvatarImage = ({ imageUrl, userName }: AvatarImageProps) => {
    return <img className="w-iconSize h-iconSize rounded-full" src={imageUrl} alt={`User ${userName} avatar`} />
}
