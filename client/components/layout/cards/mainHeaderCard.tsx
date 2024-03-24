import theme from '@/utils/theme'
import { Box, Grid } from '@mui/material'
import { Header1, Header2 } from '../../textComponents'
import Image from 'next/image'


export default function MainHeaderCard() {

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '10vh',
            borderRadius: 3,
            boxShadow: 2,
        }}>
            <Image
                src={require("@/public/stagnum_antler_bold_coloured_plain.svg")}
                height={50}
                alt={"Home background"}
                style={{ objectFit: "contain", margin: 5 }}
            />
            <Header1 text={'Stagnum'} sx={{ color: 'white' }} />
        </Box>
    )
}