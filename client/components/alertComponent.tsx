import { Alert, Box } from '@mui/material'

interface AlertComponentProps {
    alertMessage: string
    closeAlert: () => void
}

const AlertComponent: React.FC<AlertComponentProps> = ({
    alertMessage,
    closeAlert,
}) => {
    return (
        <Box position="fixed" top="8%" left="25%" zIndex={9999}>
            <Alert
                severity="error"
                variant="filled"
                onClose={() => closeAlert()}
            >
                {alertMessage}
            </Alert>
        </Box>
    )
}

export default AlertComponent
