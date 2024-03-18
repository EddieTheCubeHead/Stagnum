import { IconButton } from "@mui/material";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import axios from "axios";

function SkipButton(props: { disabled?: boolean; token: string }) {
  const skip = () => {
    const headers = { 
      'token': props.token,
  };
    axios
      .post("http://localhost:8080/pool/playback/skip",{}, {
        headers: headers
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log("Request failed", error);
      });
  };

  return (
    <IconButton aria-label="skip" onClick={skip} disabled={props.disabled}>
      <SkipNextIcon color={!props.disabled ? "primary" : "disabled"} fontSize="large" />
    </IconButton>
  );
}

export default SkipButton;
