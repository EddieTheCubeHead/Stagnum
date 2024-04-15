import { Button, Typography } from '@mui/material'

interface AltButtonProps {
    text: string
    action: () => void
    disabled?: boolean
}

const AltButton: React.FC<AltButtonProps> = ({ text, action, disabled }) => {
    return (
        <Button
            variant="outlined"
            color={'primary'}
            disableElevation
            onClick={action}
            disabled={disabled}
            sx={{
                borderRadius: 4,
                width: 'fit-content',
                border: '2px solid',
                backgroundColor: 'secondary.light',
                boxShadow: '3px 3px 3px rgba(0, 0, 0, 0.3)',
            }}
        >
            <Typography fontWeight={'bold'}>{text}</Typography>
        </Button>
    )
}

export default AltButton
