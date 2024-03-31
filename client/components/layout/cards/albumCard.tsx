import { Box, Card } from "@mui/material";
import { Header3 } from "../../textComponents";
import DefaultButton from "../../buttons/defaulButton";
import Album from "@/types/albumTypes";
import Track from "@/types/trackTypes";
import Playlist from "@/types/playlistTypes";
import Artist from "@/types/artistTypes";
import AddToPoolButton from "@/components/buttons/iconButtons/addToPoolButton";
import ShowMoreIconButton from "@/components/buttons/iconButtons/showMoreIconButton";

export default function AlbumCard(props: {
  album: Album,
  handleAdding: (newAdd: Track | Album | Playlist | Artist) => void
  token: string
  disabled: boolean
  enableAddButton: () => void
}) {

  return (
    <Card sx={{ bgcolor: 'secondary.main', width: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {props.album.icon_link && (
            <Box
              sx={{
                width: 50,
                height: 50,
                backgroundImage: `url(${props.album.icon_link})`,
                backgroundSize: 'cover',
                margin: 1,
              }}
            />
          )}
          <Header3 text={props.album.name} />
        </Box>
        <Box>
          <AddToPoolButton newAdd={props.album} handleAdding={props.handleAdding} token={props.token} disabled={props.disabled} />
          <ShowMoreIconButton token={props.token} item={props.album} handleAdding={props.handleAdding} enableAddButton={props.enableAddButton} />
        </Box>
      </Box>
    </Card>
  );
}
