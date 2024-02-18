import { Typography } from "@mui/material";

export function Header1(props: { text: string }) {
  return <Typography fontSize={30}>{props.text}</Typography>;
}

export function Header2(props: { text: string }) {
  return <Typography fontSize={24}>{props.text}</Typography>;
}

export function Header3(props: { text: string }) {
  return <Typography fontSize={18}>{props.text}</Typography>;
}

export function Text(props: { text: string }) {
  return <Typography fontSize={14}>{props.text}</Typography>;
}
