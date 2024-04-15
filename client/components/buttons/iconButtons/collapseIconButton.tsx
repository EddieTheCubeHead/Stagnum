import { IconButton } from '@mui/material'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

interface CollapseIconButtonProps {
    expanded: boolean
    handleExpandClick: () => void
}

const CollapseIconButton: React.FC<CollapseIconButtonProps> = ({
    expanded,
    handleExpandClick,
}) => {
    return (
        <IconButton
            onClick={handleExpandClick}
            sx={{
                '&:hover': {
                    color: 'primary.main',
                },
                color: 'secondary.light',
            }}
        >
            {expanded ? (
                <ExpandLessIcon color="primary" fontSize="large" />
            ) : (
                <ExpandMoreIcon color="primary" fontSize="large" />
            )}
        </IconButton>
    )
}

export default CollapseIconButton
