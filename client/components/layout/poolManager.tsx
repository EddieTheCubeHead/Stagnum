import { Box, Stack, Grid, Avatar, AvatarGroup } from '@mui/material'
import PoolTrackCard from './cards/poolCollectionCard'
import PoolCollectionCard from './cards/poolCollectionCard'
import axios from 'axios'
import DefaultButton from '../buttons/defaulButton'
import { Header2 } from '../textComponents'

export default function ManagePool(props: {
    pool: Pool
    token: string
    updatePool: (pool: Pool) => void
    expanded: boolean
}) {
    const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI
    const token = props.token
    const handleShare = () => {
        axios
            .post(
                `${backend_uri}/pool/share`,
                {},
                {
                    headers: { token },
                },
            )
            .then((response) => {
                props.updatePool(response.data)
            })
            .catch(() => {
                // TODO Error alert
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
                {props.expanded ? (
                    <Box
                        display={'flex'}
                        justifyContent={'center'}
                        alignItems={'center'}
                        gap={1}
                    >
                        <Header2
                            text={
                                props.pool.users.length > 0
                                    ? `${props.pool.users[0].user.display_name}'s pool`
                                    : 'Create or join a pool'
                            }
                            color={'secondary.light'}
                        />
                        {props.pool.share_code === null ? (
                            <DefaultButton text="share" action={handleShare} />
                        ) : (
                            <Header2
                                text={props.pool.share_code}
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
                                    props.pool.users.length > 0
                                        ? `${props.pool.users[0].user.display_name}'s pool`
                                        : 'Create or join a pool'
                                }
                                color={'secondary.light'}
                            />
                        </Grid>
                        <Grid item xs={1}>
                            {props.pool.share_code === null ? (
                                <DefaultButton
                                    text="share"
                                    action={handleShare}
                                />
                            ) : (
                                <Header2
                                    text={props.pool.share_code}
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
                            {props.pool.users.length > 3 ? (
                                <AvatarGroup total={props.pool.users.length}>
                                    {props.pool.users.map((user: PoolUser) => (
                                        <Avatar
                                            key={user.user.display_name}
                                            alt={user.user.display_name}
                                            src={user.user.icon_url}
                                        />
                                    ))}
                                </AvatarGroup>
                            ) : (
                                <>
                                    {props.pool.users.map((user: PoolUser) => (
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
                {props.pool?.users?.map((user) => (
                    <>
                        {user.tracks?.map((poolItem: any, key: number) => (
                            <PoolTrackCard
                                poolItem={poolItem}
                                key={key}
                                token={props.token}
                                updatePool={props.updatePool}
                            />
                        ))}
                    </>
                ))}
                {props.pool?.users?.map((user) => (
                    <>
                        {user.collections?.map((poolItem: any, key: number) => (
                            <Stack spacing={2} key={key}>
                                <PoolCollectionCard
                                    poolItem={poolItem}
                                    token={props.token}
                                    updatePool={props.updatePool}
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
                                                    token={props.token}
                                                    updatePool={
                                                        props.updatePool
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
