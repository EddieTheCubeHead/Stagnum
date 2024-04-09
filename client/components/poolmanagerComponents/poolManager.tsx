import { Box, Stack, Grid, Avatar, AvatarGroup } from '@mui/material'
import PoolTrackCard from './poolCollectionCard'
import PoolCollectionCard from './poolCollectionCard'
import axios from 'axios'
import DefaultButton from '../buttons/defaulButton'
import { Header2 } from '../textComponents'
import { Pool, PoolUser } from '../types'

interface PoolManagerProps {
    pool: Pool
    token: string
    // eslint-disable-next-line no-unused-vars
    updatePool: (pool: Pool) => void
    expanded: boolean
    // eslint-disable-next-line no-unused-vars
    setErrorAlert: (message: string) => void
}

const PoolManager: React.FC<PoolManagerProps> = ({
    pool,
    token,
    updatePool,
    expanded,
    setErrorAlert,
}) => {
    const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI
    const handleShare = (): void => {
        axios
            .post(
                `${backend_uri}/pool/share`,
                {},
                {
                    headers: { Authorization: token },
                },
            )
            .then((response) => {
                updatePool(response.data)
            })
            .catch((error) => {
                setErrorAlert(
                    `Sharing pool failed with error: ${error.response.data.detail}`,
                )
            })
    }

    return (
        <Box
            sx={{
                bgcolor: 'secondary.dark',
                display: 'flex',
                overflow: 'auto',
                borderRadius: '12px',
                boxShadow: 2,
            }}
        >
            <Stack
                spacing={2}
                sx={{
                    width: 1,
                    margin: 1,
                }}
            >
                {expanded ? (
                    <Box
                        display={'flex'}
                        justifyContent={'center'}
                        alignItems={'center'}
                        gap={1}
                    >
                        <Header2
                            text={
                                pool.users.length > 0
                                    ? `${pool.users[0].user.display_name}'s pool`
                                    : 'Create or join a pool'
                            }
                            color={'secondary.light'}
                        />
                        {pool.share_code === null ? (
                            <DefaultButton text="share" action={handleShare} />
                        ) : (
                            <Header2
                                text={pool.share_code}
                                color={'secondary.light'}
                            />
                        )}
                    </Box>
                ) : (
                    <Grid
                        container
                        display={'flex'}
                        justifyContent={'center'}
                        alignItems={'center'}
                    >
                        <Grid item xs={9}>
                            <Header2
                                text={
                                    pool.users.length > 0
                                        ? `${pool.users[0].user.display_name}'s pool`
                                        : 'Create or join a pool'
                                }
                                color={'secondary.light'}
                            />
                        </Grid>
                        <Grid item xs={1}>
                            {pool.share_code === null ? (
                                <DefaultButton
                                    text="share"
                                    action={handleShare}
                                />
                            ) : (
                                <Header2
                                    text={pool.share_code}
                                    color={'secondary.light'}
                                />
                            )}
                        </Grid>
                        <Grid
                            item
                            xs={2}
                            display={'flex'}
                            justifyContent={'center'}
                            alignItems={'center'}
                        >
                            {pool.users.length > 3 ? (
                                <AvatarGroup total={pool.users.length}>
                                    {pool.users.map((user: PoolUser) => (
                                        <Avatar
                                            key={user.user.display_name}
                                            alt={user.user.display_name}
                                            src={user.user.icon_url}
                                        />
                                    ))}
                                </AvatarGroup>
                            ) : (
                                <>
                                    {pool.users.map((user: PoolUser) => (
                                        <Avatar
                                            key={user.user.display_name}
                                            alt={user.user.display_name}
                                            src={user.user.icon_url}
                                        />
                                    ))}
                                </>
                            )}
                        </Grid>
                    </Grid>
                )}
                {pool?.users?.map((user) => (
                    <>
                        {user.tracks?.map((poolItem: any, key: number) => (
                            <PoolTrackCard
                                poolItem={poolItem}
                                key={key}
                                token={token}
                                updatePool={updatePool}
                                setErrorAlert={setErrorAlert}
                            />
                        ))}
                    </>
                ))}
                {pool?.users?.map((user) => (
                    <>
                        {user.collections?.map((poolItem: any, key: number) => (
                            <Stack spacing={2} key={key}>
                                <PoolCollectionCard
                                    poolItem={poolItem}
                                    token={token}
                                    updatePool={updatePool}
                                    setErrorAlert={setErrorAlert}
                                />
                                {poolItem.tracks.map(
                                    (
                                        poolCollectionItem: any,
                                        innerKey: number,
                                    ) => (
                                        /* aling this box to the right*/
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'right',
                                            }}
                                            key={innerKey}
                                        >
                                            <Box sx={{ width: '95%' }}>
                                                <PoolTrackCard
                                                    poolItem={
                                                        poolCollectionItem
                                                    }
                                                    token={token}
                                                    updatePool={updatePool}
                                                    setErrorAlert={
                                                        setErrorAlert
                                                    }
                                                />
                                            </Box>
                                        </Box>
                                    ),
                                )}
                            </Stack>
                        ))}
                    </>
                ))}
            </Stack>
        </Box>
    )
}

export default PoolManager
