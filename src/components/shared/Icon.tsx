import type { CSSProperties } from "react";

interface IconProps {
  name: string;
  size?: number;
  filled?: boolean;
  className?: string;
  style?: CSSProperties;
  color?: string;
}

export function Icon({ name, size = 20, filled = false, className, style, color }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined${className ? ` ${className}` : ""}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 300, 'GRAD' 0, 'opsz' ${size}`,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color,
        ...style,
      }}
    >
      {name}
    </span>
  );
}
