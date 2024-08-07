import {
    Box,
    Stack,
    Grid,
    Avatar,
    AvatarGroup,
    Tooltip,
    IconButton,
} from '@mui/material'
import PoolTrackCard from './poolCollectionCard'
import PoolCollectionCard from './poolCollectionCard'
import axios from 'axios'
import DefaultButton from '../buttons/defaulButton'
import { Header2 } from '../textComponents'
import { Pool, PoolUser, User } from '../types'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

interface PoolManagerProps {
    pool: Pool
    // eslint-disable-next-line no-unused-vars
    updatePool: (pool: Pool) => void
    expanded: boolean
    // eslint-disable-next-line no-unused-vars
    user: User
    setErrorAlert: (message: string, type: 'error' | 'success') => void
    handleDelete: () => void
    handleLeave: () => void
}

const PoolManager: React.FC<PoolManagerProps> = ({
    pool,
    updatePool,
    expanded,
    setErrorAlert,
    user,
    handleDelete,
    handleLeave,
}) => {
    const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI
    if (pool === null || pool.users === undefined) {
        pool = {
            users: [],
            owner: null,
            share_code: null,
            currently_playing: {
                name: '',
                spotify_icon_uri: '',
                spotify_resource_uri: '',
                duration_ms: 0,
            },
        }
    }
    const handleShare = (): void => {
        axios
            .post(
                `${backend_uri}/pool/share`,
                {},
                {
                    headers: {
                        Authorization: localStorage.getItem('token')
                            ? localStorage.getItem('token')
                            : '',
                    },
                },
            )
            .then((response) => {
                localStorage.setItem(
                    'token',
                    response.config.headers.Authorization as string,
                )
                updatePool(response.data)
                copyToClipboard(response.data)
            })
            .catch((error) => {
                setErrorAlert(
                    `Sharing a pool failed with error: ${error.response.data.detail}`,
                    'error',
                )
            })
    }

    const copyToClipboard = (pool: Pool): void => {
        if (pool.share_code !== null) {
            navigator.clipboard.writeText(pool.share_code)
            setErrorAlert('Code copied to clipboard', 'success')
        } else {
            setErrorAlert('Unable to copy code to clipboard', 'error')
        }
    }

    const avatar = (user: PoolUser): JSX.Element => (
        <Tooltip
            title={user.user.display_name}
            key={user.user.display_name}
            sx={{
                boxShadow: '3px 3px 3px rgba(0, 0, 0, 0.3)',
                '&:hover': {
                    transform: 'scale(1.1)',
                },
            }}
        >
            <Avatar alt={user.user.display_name} src={user.user.icon_url} />
        </Tooltip>
    )

    return (
        <Box
            sx={{
                bgcolor: 'secondary.dark',
                display: 'flex',
                overflow: 'auto',
                borderRadius: '12px',
                boxShadow: '3px 3px 3px',
                px: 1,
            }}
        >
            <Stack
                spacing={2}
                sx={{
                    width: 1,
                    margin: 1,
                }}
            >
                <Grid container>
                    <Grid item container direction={'row'} xs={6} gap={4}>
                        <Header2
                            text={
                                pool.users.length > 0
                                    ? `${pool.owner?.display_name}'s pool`
                                    : 'Create or join a pool'
                            }
                            color={'secondary.light'}
                        />
                        {pool.users.length > 0 && (
                            <>
                                {pool.share_code === null ? (
                                    <DefaultButton
                                        text="share"
                                        action={handleShare}
                                    />
                                ) : (
                                    <Box display={'flex'} marginRight={2}>
                                        <Header2
                                            text={pool.share_code}
                                            color={'secondary.light'}
                                        />
                                        <IconButton
                                            aria-label="copy-icon"
                                            onClick={() =>
                                                copyToClipboard(pool)
                                            }
                                            sx={{
                                                '&:hover': {
                                                    color: 'primary.main',
                                                    transform: 'scale(1.2)',
                                                },
                                                color: 'secondary.light',
                                                marginRight: 1,
                                                marginLeft: 1,
                                            }}
                                        >
                                            <ContentCopyIcon />
                                        </IconButton>
                                    </Box>
                                )}
                            </>
                        )}
                    </Grid>
                    <Grid
                        item
                        xs={6}
                        display={'flex'}
                        justifyContent={'end'}
                        alignItems={'end'}
                        gap={4}
                    >
                        {pool.users.length > 0 && (
                            <DefaultButton
                                text={
                                    pool.owner?.spotify_id === user.spotify_id
                                        ? 'Delete Pool'
                                        : 'Leave Pool'
                                }
                                action={
                                    pool.owner?.spotify_id === user.spotify_id
                                        ? handleDelete
                                        : handleLeave
                                }
                            />
                        )}
                        {!expanded && (
                            <>
                                {pool.users.length > 3 ? (
                                    <AvatarGroup total={pool.users.length}>
                                        {pool.users.map((user: PoolUser) =>
                                            avatar(user),
                                        )}
                                    </AvatarGroup>
                                ) : (
                                    <>
                                        {pool.users.map((user: PoolUser) =>
                                            avatar(user),
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </Grid>
                </Grid>
                {pool?.users?.map((user) => (
                    <>
                        {user.tracks?.map((poolItem: any, key: number) => (
                            <PoolTrackCard
                                poolItem={poolItem}
                                key={key}
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
