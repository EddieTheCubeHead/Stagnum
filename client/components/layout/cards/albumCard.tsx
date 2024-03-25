import { Box, Card } from "@mui/material";
import { Header3 } from "../../textComponents";
import DefaultButton from "../../buttons/defaulButton";
import Album from "@/types/albumTypes";

export default function AlbumCard(props: {
  album: Album,
  handleAdd: (newAdd: Track | Album | Playlist | Artist) => void
  token: string
  disabled: boolean
  enableAddButton: () => void
}) {
  const addAlbum = () => {
    props.handleAdd(props.album);
  };

  return (
    <Card sx={{ bgcolor: 'secondary.light', width: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {album.icon_link && (
            <Box
              sx={{
                width: 50,
                height: 50,
                backgroundImage: `url(${album.icon_link})`,
                backgroundSize: 'cover',
                margin: 1,
              }}
            />
          )}
          <Header3 text={truncatedName} />
        </Box>
        <Box>
          <AddToPoolButton newAdd={album} handleAdding={handleAdding} token={props.token} disabled={props.disabled} />
          <ShowMoreIconButton token={props.token} item={album} handleAdding={handleAdding} enableAddButton={props.enableAddButton} />
        </Box>
      </Box>
    </Card>
  );
}
