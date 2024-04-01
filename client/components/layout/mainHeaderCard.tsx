import theme from '@/utils/theme'
import { Box } from '@mui/material'
import Image from 'next/image'

export default function MainHeaderCard() {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '10vh',
                borderRadius: 3,
                boxShadow: 2,
            }}
        >
            <Image
                src={require('@/public/Stagnum_Logo.png')}
                height={45}
                alt={'Home background'}
                style={{ objectFit: 'contain', margin: 10 }}
            />
        </Box>
    )
}
