interface ButtonProps {
    onClick: () => void
    text: string
}

export const Button = ({ onClick, text }: ButtonProps) => {
    return (
        <button
            className="bg-clickable py-0.5 px-6 rounded-full border-stroke border-2 font-semibold drop-shadow-md hover:border-accent"
            onClick={onClick}
        >
            {text}
        </button>
    )
}
