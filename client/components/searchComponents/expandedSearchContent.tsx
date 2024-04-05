import { Box, Stack } from '@mui/material'
import { Header2 } from '../textComponents'
import AlbumCard from './cards/albumCard'
import TrackCard from './cards/trackCard'
import PlaylistCard from './cards/playlistCard'
import ArtistCard from './cards/artistCard'
import { Album, Artist, Playlist, Pool, Track } from '../types'

interface ExpandedSearchContentProps {
    trackList: Track[]
    albumList: Album[]
    playlistList: Playlist[]
    artistList: Artist[]
    updatePool: (pool: Pool) => void
    token: string
    disabled: boolean
    enableAddButton: () => void
}

const ExpandedSearchContent: React.FC<ExpandedSearchContentProps> = ({ trackList, albumList, playlistList, artistList, updatePool, token, disabled, enableAddButton }) => {
    return (
        <Stack sx={{ padding: 1, width: 1 }}>
            <Header2 text={'Tracks'} sx={{ color: 'white' }} />
            <Box
                sx={{
                    margin: 1,
                    marginLeft: 2,
                    display: 'flex',
                    '& > *': {
                        marginRight: 4,
                        width: '20%',
                    },
                }}
            >
                {trackList.slice(0, 2).map((track, key) => (
                    <TrackCard
                        key={key}
                        track={track}
                        updatePool={updatePool}
                        token={token}
                        disabled={disabled}
                        enableAddButton={enableAddButton}
                    />
                ))}
            </Box>
            <Box
                sx={{
                    margin: 1,
                    marginLeft: 2,
                    display: 'flex',
                    '& > *': {
                        marginRight: 4,
                        width: '20%',
                    },
                }}
            >
                {trackList.slice(2, 4).map((track, key) => (
                    <TrackCard
                        key={key}
                        track={track}
                        updatePool={updatePool}
                        token={token}
                        disabled={disabled}
                        enableAddButton={enableAddButton}
                    />
                ))}
            </Box>
            <Header2 text={'Albums'} sx={{ color: 'white' }} />
            <Box
                sx={{
                    margin: 1,
                    marginLeft: 2,
                    display: 'flex',
                    '& > *': {
                        marginRight: 4,
                    },
                }}
            >
                {albumList.slice(0, 2).map((album, key) => (
                    <AlbumCard
                        key={key}
                        album={album}
                        updatePool={updatePool}
                        token={token}
                        disabled={disabled}
                        enableAddButton={enableAddButton}
                    />
                ))}
            </Box>
            <Box
                sx={{
                    margin: 1,
                    marginLeft: 2,
                    display: 'flex',
                    '& > *': {
                        marginRight: 4,
                    },
                }}
            >
                {albumList.slice(2, 4).map((album, key) => (
                    <AlbumCard
                        key={key}
                        album={album}
                        updatePool={updatePool}
                        token={token}
                        disabled={disabled}
                        enableAddButton={enableAddButton}
                    />
                ))}
            </Box>
            <Header2 text={'Playlists'} sx={{ color: 'white' }} />
            <Box
                sx={{
                    margin: 1,
                    marginLeft: 2,
                    display: 'flex',
                    '& > *': {
                        marginRight: 4,
                    },
                }}
            >
                {playlistList.slice(0, 2).map((playlist, key) => (
                    <PlaylistCard
                        key={key}
                        playlist={playlist}
                        updatePool={updatePool}
                        token={token}
                        disabled={disabled}
                        enableAddButton={enableAddButton}
                    />
                ))}
            </Box>
            <Box
                sx={{
                    margin: 1,
                    marginLeft: 2,
                    display: 'flex',
                    '& > *': {
                        marginRight: 4,
                    },
                }}
            >
                {playlistList.slice(2, 4).map((playlist, key) => (
                    <PlaylistCard
                        key={key}
                        playlist={playlist}
                        updatePool={updatePool}
                        token={token}
                        disabled={disabled}
                        enableAddButton={enableAddButton}
                    />
                ))}
            </Box>
            <Header2 text={'Artists'} sx={{ color: 'white' }} />
            <Box
                sx={{
                    margin: 1,
                    marginLeft: 2,
                    display: 'flex',
                    '& > *': {
                        marginRight: 4,
                    },
                }}
            >
                {artistList.slice(0, 2).map((artist, key) => (
                    <ArtistCard
                        key={key}
                        artist={artist}
                        updatePool={updatePool}
                        token={token}
                        disabled={disabled}
                        enableAddButton={enableAddButton}
                    />
                ))}
            </Box>
            <Box
                sx={{
                    margin: 1,
                    marginLeft: 2,
                    display: 'flex',
                    '& > *': {
                        marginRight: 4,
                    },
                }}
            >
                {artistList.slice(2, 4).map((artist, key) => (
                    <ArtistCard
                        key={key}
                        artist={artist}
                        updatePool={updatePool}
                        token={token}
                        disabled={disabled}
                        enableAddButton={enableAddButton}
                    />
                ))}
            </Box>
        </Stack>
    )
}
