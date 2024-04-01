import { IconButton } from "@mui/material";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function CollapseiconButton(props: { expanded: boolean, handleExpandClick: () => void }) {
    return (
        <IconButton onClick={props.handleExpandClick}>
            {props.expanded ? <ExpandLessIcon color="primary" fontSize="large"/> : <ExpandMoreIcon color="primary" fontSize="large"/>}
        </IconButton>
    )
}