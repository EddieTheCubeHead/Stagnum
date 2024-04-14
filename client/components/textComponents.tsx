import { Typography, TypographyProps } from '@mui/material'

interface CustomTypographyProps extends TypographyProps {
    text: string
}

export const Header1: React.FC<CustomTypographyProps> = ({
    text,
    ...typographyProps
}) => {
    return (
        <Typography fontSize={30} {...typographyProps}>
            {text}
        </Typography>
    )
}

export const Header2: React.FC<CustomTypographyProps> = ({
    text,
    ...typographyProps
}) => {
    return (
        <Typography fontSize={24} {...typographyProps}>
            {text}
        </Typography>
    )
}

export const Header3: React.FC<CustomTypographyProps> = ({
    text,
    ...typographyProps
}) => {
    return (
        <Typography fontSize={18} {...typographyProps}>
            {text}
        </Typography>
    )
}

export const Text: React.FC<CustomTypographyProps> = ({
    text,
    ...typographyProps
}) => {
    return (
        <Typography fontSize={14} {...typographyProps}>
            {text}
        </Typography>
    )
}
