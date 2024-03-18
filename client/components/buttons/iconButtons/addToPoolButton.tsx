import { IconButton, Tooltip } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';

export default function AddToPoolButton() {

    const handleClick = () => {
        console.log('Pressed')
    };

    return (
        <Tooltip title='Add to pool'>
            <IconButton
                aria-label=""
                onClick={handleClick}
                sx={{
                    "&:hover": {
                        color: 'white',
                    },
                    color: 'black',
                    margin: 1
                }}
            >
                <AddIcon />
            </IconButton>
        </Tooltip >
    )
}