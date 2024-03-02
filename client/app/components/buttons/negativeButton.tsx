import { Button, Typography } from "@mui/material";

function NegativeButton(props: {
  text: string;
  action: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      variant="contained"
      color="warning"
      disableElevation
      onClick={props.action}
      disabled={props.disabled}
      sx={{ borderRadius: 4, width: "fit-content" }}
    >
      <Typography fontWeight={"bold"}>{props.text}</Typography>
    </Button>
  );
}

export default NegativeButton;
