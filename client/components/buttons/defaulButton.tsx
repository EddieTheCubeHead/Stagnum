import { Button, Typography } from '@mui/material'

interface DefaultButtonProps {
    text: string
    action: () => void
    disabled?: boolean
}

const DefaultButton: React.FC<DefaultButtonProps> = ({
    text,
    action,
    disabled,
}) => {
    return (
        <Button
            variant="contained"
            color={'primary'}
            disableElevation
            onClick={action}
            disabled={disabled}
            sx={{ borderRadius: 4, width: 'fit-content' }}
        >
            <Typography fontWeight={'bold'}>{text}</Typography>
        </Button>
    )
}

export default DefaultButton
