import { Box, Stack } from "@mui/material";
import { Header2 } from "../textComponents";
import Track from "@/types/trackTypes";
import Album from "@/types/albumTypes";
import AlbumCard from "./cards/albumCard";
import Playlist from "@/types/playlistTypes";
import Artist from "@/types/artistTypes";
import TrackCard from "./cards/trackCard";
import PlaylistCard from "./cards/playlistCard";
import ArtistCard from "./cards/artistCard";

export default function ExpandedSearchContent(props: {
    trackList: Track[], albumList: Album[], playlistList: Playlist[], artistList: Artist[],
    handleAdd: (newAdd: Track | Album | Playlist | Artist) => void
    token: string
}) {
    return (
        <Stack sx={{ margin: 1, width: 1 }}>
            <Header2 text={"Tracks"} sx={{ color: 'white' }} />
            <Box sx={{
                margin: 1,
                marginLeft: 2,
                display: 'flex',
                '& > *': {
                    marginRight: 4,
                    width: '20%'
                }
            }}>
                {props.trackList.slice(0, 2).map((track, key) => (
                    <TrackCard key={key} track={track} handleAdd={props.handleAdd} token={props.token} />
                ))}
            </Box>
            <Box sx={{
                margin: 1,
                marginLeft: 2,
                display: 'flex',
                '& > *': {
                    marginRight: 4,
                    width: '20%'
                }
            }}>
                {props.trackList.slice(2, 4).map((track, key) => (
                    <TrackCard key={key} track={track} handleAdd={props.handleAdd} token={props.token} />
                ))}
            </Box>
            <Header2 text={"Albums"} sx={{ color: 'white' }} />
            <Box sx={{
                margin: 1,
                marginLeft: 2,
                display: 'flex',
                '& > *': {
                    marginRight: 4
                }
            }}>
                {props.albumList.slice(0, 2).map((album, key) => (
                    <AlbumCard key={key} album={album} handleAdd={props.handleAdd} token={props.token} />
                ))}
            </Box>
            <Box sx={{
                margin: 1,
                marginLeft: 2,
                display: 'flex',
                '& > *': {
                    marginRight: 4
                }
            }}>
                {props.albumList.slice(2, 4).map((album, key) => (
                    <AlbumCard key={key} album={album} handleAdd={props.handleAdd} token={props.token} />
                ))}
            </Box>
            <Header2 text={"Playlists"} sx={{ color: 'white' }} />
            <Box sx={{
                margin: 1,
                marginLeft: 2,
                display: 'flex',
                '& > *': {
                    marginRight: 4
                }
            }}>
                {props.playlistList.slice(0, 2).map((playlist, key) => (
                    <PlaylistCard key={key} playlist={playlist} handleAdd={props.handleAdd} token={props.token} />
                ))}
            </Box>
            <Box sx={{
                margin: 1,
                marginLeft: 2,
                display: 'flex',
                '& > *': {
                    marginRight: 4
                }
            }}>
                {props.playlistList.slice(2, 4).map((playlist, key) => (
                    <PlaylistCard key={key} playlist={playlist} handleAdd={props.handleAdd} token={props.token} />
                ))}
            </Box>
            <Header2 text={"Artists"} sx={{ color: 'white' }} />
            <Box sx={{
                margin: 1,
                marginLeft: 2,
                display: 'flex',
                '& > *': {
                    marginRight: 4
                }
            }}>
                {props.artistList.slice(0, 2).map((artist, key) => (
                    <ArtistCard key={key} artist={artist} handleAdd={props.handleAdd} token={props.token} />
                ))}
            </Box>
            <Box sx={{
                margin: 1,
                marginLeft: 2,
                display: 'flex',
                '& > *': {
                    marginRight: 4
                }
            }}>
                {props.artistList.slice(2, 4).map((artist, key) => (
                    <ArtistCard key={key} artist={artist} handleAdd={props.handleAdd} token={props.token} />
                ))}
            </Box>
        </Stack>
    )
}