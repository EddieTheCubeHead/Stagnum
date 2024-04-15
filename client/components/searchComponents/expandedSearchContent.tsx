import { Box, LinearProgress, Stack } from '@mui/material'
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
    // eslint-disable-next-line no-unused-vars
    updatePool: (pool: Pool) => void
    disabled: boolean
    enableAddButton: () => void
    // eslint-disable-next-line no-unused-vars
    setErrorAlert: (message: string, type: 'error' | 'success') => void
    ongoingSearch: boolean
}

const ExpandedSearchContent: React.FC<ExpandedSearchContentProps> = ({
    trackList,
    albumList,
    playlistList,
    artistList,
    updatePool,
    disabled,
    enableAddButton,
    setErrorAlert,
    ongoingSearch,
}) => {
    const track = (key: number, track: Track): JSX.Element => (
        <TrackCard
            key={key}
            track={track}
            updatePool={updatePool}
            disabled={disabled}
            enableAddButton={enableAddButton}
            setErrorAlert={setErrorAlert}
        />
    )

    const album = (key: number, album: Album): JSX.Element => (
        <AlbumCard
            key={key}
            album={album}
            updatePool={updatePool}
            disabled={disabled}
            enableAddButton={enableAddButton}
            setErrorAlert={setErrorAlert}
        />
    )

    const playlist = (key: number, playlis: Playlist): JSX.Element => (
        <PlaylistCard
            key={key}
            playlist={playlis}
            updatePool={updatePool}
            disabled={disabled}
            enableAddButton={enableAddButton}
            setErrorAlert={setErrorAlert}
        />
    )

    const artist = (key: number, artist: Artist): JSX.Element => (
        <ArtistCard
            key={key}
            artist={artist}
            updatePool={updatePool}
            disabled={disabled}
            enableAddButton={enableAddButton}
            setErrorAlert={setErrorAlert}
        />
    )

    return (
        <Box sx={{ width: 1, boxShadow: '3px 3px 3px' }}>
            {ongoingSearch ? (
                <Box sx={{ width: '100%', padding: 2 }}>
                    <LinearProgress
                        sx={{ height: 7, boxShadow: '3px 3px 3px' }}
                    />
                </Box>
            ) : (
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
                        {trackList
                            .slice(0, 2)
                            .map((trackItem, key) => track(key, trackItem))}
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
                        {trackList
                            .slice(2, 4)
                            .map((trackItem, key) => track(key, trackItem))}
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
                        {albumList
                            .slice(0, 2)
                            .map((albumItem, key) => album(key, albumItem))}
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
                        {albumList
                            .slice(2, 4)
                            .map((albumItem, key) => album(key, albumItem))}
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
                        {playlistList
                            .slice(0, 2)
                            .map((playlistItem, key) =>
                                playlist(key, playlistItem),
                            )}
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
                        {playlistList
                            .slice(2, 4)
                            .map((playlistItem, key) =>
                                playlist(key, playlistItem),
                            )}
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
                        {artistList
                            .slice(0, 2)
                            .map((artistItem, key) => artist(key, artistItem))}
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
                        {artistList
                            .slice(2, 4)
                            .map((artistItem, key) => artist(key, artistItem))}
                    </Box>
                </Stack>
            )}
        </Box>
    )
}

export default ExpandedSearchContent
