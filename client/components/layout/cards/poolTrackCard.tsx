import DeleteButton from "@/components/buttons/iconButtons/deleteButton";
import { Header3 } from "@/components/textComponents";
import { Box, Card } from "@mui/material";

export default function PoolTrackCard(props: {
    poolItem: PoolTrack
    token: string
    updatePool: (pool: Pool) => void
}) {

    const truncatedName = props.poolItem.name.length > 25 ? props.poolItem.name.slice(0, 25) + "..." : props.poolItem.name;

    return (
        <Card sx={{ bgcolor: 'secondary.main', width: 0.6, minHeight: 66 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                        sx={{
                            width: 50,
                            height: 50,
                            backgroundImage: `url(${props.poolItem.spotify_icon_uri})`,
                            bgcolor: 'black',
                            backgroundSize: 'cover',
                            margin: 1,
                        }}
                    />

                    <Header3 text={truncatedName} />
                </Box>
                <Box>
                    <DeleteButton poolItem={props.poolItem} token={props.token} updatePool={props.updatePool} />
                </Box>
            </Box>
        </Card>
    )
}