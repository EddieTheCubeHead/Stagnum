import { Typography, TypographyProps } from "@mui/material";

interface CustomTypographyProps extends TypographyProps {
  text: string;
}

export function Header1({ text, ...typographyProps }: CustomTypographyProps) {
  return (
    <Typography fontSize={62} {...typographyProps}>
      {text}
    </Typography>
  );
}

export function Header2({ text, ...typographyProps }: CustomTypographyProps) {
  return (
    <Typography fontSize={24} {...typographyProps}>
      {text}
    </Typography>
  );
}

export function Header3({ text, ...typographyProps }: CustomTypographyProps) {
  return (
    <Typography fontSize={18} {...typographyProps}>
      {text}
    </Typography>
  );
}

export function Text({ text, ...typographyProps }: CustomTypographyProps) {
  return (
    <Typography fontSize={14} {...typographyProps}>
      {text}
    </Typography>
  );
}
