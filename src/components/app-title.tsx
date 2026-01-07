import { cn } from "@/lib/utils";
import React from "react";

type TitleSize = "sm" | "md" | "lg" | "xl";

interface Props {
  size?: TitleSize;
  text: string;
  className?: string;
  align?: "left" | "center" | "right";
}

export const Title: React.FC<Props> = ({
  text,
  size = "lg",
  align = "left",
  className,
}) => {
  const tagBySize = {
    sm: "h4",
    md: "h3",
    lg: "h2",
    xl: "h1",
  } as const;

  const baseStyles = "font-semibold w-full tracking-tight text-foreground";

  const sizeStyles = {
    sm: "text-sm xs1:text-sm ",
    md: "text-lg xs1:text-xl",
    lg: "text-xl xs1:text-2xl",
    xl: "text-2xl xs1:text-3xl font-bold",
  } as const;

  const alignStyles = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  } as const;

  return React.createElement(
    tagBySize[size],
    {
      className: cn(
        baseStyles,
        sizeStyles[size],
        alignStyles[align],
        className,
      ),
    },
    text,
  );
};
