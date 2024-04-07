import { Box } from '@mui/material'
import Image from 'next/image'

const MainHeader: React.FC = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 3,
                boxShadow: 2,
            }}
        >
            <Image
                src={require('@/public/Stagnum_Logo.png')}
                height={'60'}
                alt={'Home background'}
                style={{ objectFit: 'contain', margin: 10 }}
            />
        </Box>
    )
}

export default MainHeader
