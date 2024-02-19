import { Button, Typography } from "@mui/material";

function AltButton(props: {
  text: string;
  action: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      variant="outlined"
      disableElevation
      onClick={props.action}
      disabled={props.disabled}
      sx={{ borderRadius: 4, width: "fit-content", border: "2px solid" }}
    >
      <Typography fontWeight={"bold"}>{props.text}</Typography>
    </Button>
  );
}

export default AltButton;
