interface ButtonProps {
    onClick: () => void
    text: string
    variant?: ButtonVariant
}

export const enum ButtonVariant {
    Confirm,
    Warn,
}

export const Button = ({ onClick, text, variant }: ButtonProps) => {
    let colorClassNamePart: string = "bg-clickable border-stroke hover:border-accent"
    switch (variant) {
        case ButtonVariant.Confirm:
            colorClassNamePart = "bg-confirm-bg border-stroke hover:border-confirm"
            break
        case ButtonVariant.Warn:
            colorClassNamePart = "bg-error-bg border-stroke hover:border-error"
    }
    return (
        <button
            className={`${colorClassNamePart} py-0.5 px-2 min-w-24 rounded-full border-2 font-semibold drop-shadow-md`}
            onClick={onClick}
        >
            {text}
        </button>
    )
}
