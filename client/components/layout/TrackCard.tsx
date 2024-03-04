import { Box, Card } from "@mui/material";
import { Header3 } from "../textComponents";
import DefaultButton from "../buttons/defaulButton";
import theme from "@/utils/theme";
import Track from "@/types/trackTypes";

export default function TrackCard(props: { track: Track }) {
    return (
        <Card
            sx={{
                backgroundColor: theme.palette.secondary.main,
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}>
            <Header3 text={props.track.name} />
            <Box sx={{
                marginLeft: 'auto',
                marginRight: 1,
                marginBottom: 1
            }}>
                <DefaultButton text={"Add to pool"} action={() => { }} />
            </Box>
        </Card>
    )
}