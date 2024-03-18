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
}) {
    return (
        <Stack>
            <Box sx={{
                margin: 2
            }}>
                <Header2 text={"Tracks"} sx={{ color: 'white' }} />
                {props.trackList.slice(0, 5).map((track, key) => (
                    <TrackCard key={key} track={track} handleAdd={props.handleAdd} />
                ))}
                <Box>
                    <Header2 text={"Albums"} sx={{ color: 'white' }} />
                    {props.albumList.slice(0, 5).map((album, key) => (
                        <AlbumCard key={key} album={album} handleAdd={props.handleAdd} />
                    ))}
                </Box>
                <Box>
                    <Header2 text={"Playlists"} sx={{ color: 'white' }} />
                    {props.playlistList.slice(0, 5).map((playlist, key) => (
                        <PlaylistCard key={key} playlist={playlist} handleAdd={props.handleAdd} />
                    ))}
                </Box>
                <Box>
                    <Header2 text={"Artists"} sx={{ color: 'white' }} />
                    {props.artistList.slice(0, 5).map((artist, key) => (
                        <ArtistCard key={key} artist={artist} handleAdd={props.handleAdd} />
                    ))}
                </Box>
            </Box>
        </Stack>
    )
}