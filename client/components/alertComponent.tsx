import { Alert, Box } from '@mui/material'

interface AlertComponentProps {
    alertMessage: string
    closeAlert: () => void
    type: 'success' | 'error'
}

const AlertComponent: React.FC<AlertComponentProps> = ({
    alertMessage,
    closeAlert,
    type,
}) => {
    return (
        <Box position="fixed" top="8%" left="15%" zIndex={9999}>
            <Alert
                severity={type}
                variant="filled"
                onClose={() => closeAlert()}
                sx={{ boxShadow: '3px 3px 3px rgba(0, 0, 0, 0.3)' }}
            >
                {alertMessage}
            </Alert>
        </Box>
    )
}

export default AlertComponent
