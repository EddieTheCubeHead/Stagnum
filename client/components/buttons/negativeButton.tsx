import { Button, Typography } from '@mui/material'

interface NegativeButtonProps {
    text: string
    action: () => void
    disabled?: boolean
}

const NegativeButton: React.FC<NegativeButtonProps> = ({
    text,
    action,
    disabled,
}) => {
    return (
        <Button
            variant="contained"
            color="warning"
            disableElevation
            onClick={action}
            disabled={disabled}
            sx={{ borderRadius: 4, width: 'fit-content' }}
        >
            <Typography fontWeight={'bold'}>{text}</Typography>
        </Button>
    )
}

export default NegativeButton
