import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IconButton } from '@mui/material';

export default function CollapseIconButton(props: {
    expanded: boolean, setExpanded: (expanded: boolean) => void,
}) {

    return (
        <IconButton sx={{
            padding: 1,
            margin: 1
        }}
            onClick={() => props.setExpanded(!props.expanded)}>
            {props.expanded
                ? <ExpandLessIcon fontSize='large' sx={{ color: 'secondary.light' }} />
                : <ExpandMoreIcon fontSize='large' sx={{ color: 'secondary.light' }} />
            }
        </IconButton>
    )
}