import { Alert, Box } from "@mui/material"

interface AlertComponentProps {
    closeAlert: () => void
}

const AlertComponent: React.FC<AlertComponentProps> = ({ closeAlert }) => {
    return (
        <Box
            position="fixed"
            top="8%"
            left="25%"
            zIndex={9999}
        >
            <Alert severity="error" variant='filled' onClose={() => closeAlert()}>
                There was an error with the login request.
            </Alert>
        </Box>
    )
}

export default AlertComponent