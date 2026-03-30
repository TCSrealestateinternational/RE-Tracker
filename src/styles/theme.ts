export const theme = {
  colors: {
    teal: "#0c414e",
    rust: "#9d442a",
    gold: "#bc804d",
    sand: "#d7c2b0",
    white: "#ffffff",
    gray50: "#f9fafb",
    gray100: "#f3f4f6",
    gray200: "#e5e7eb",
    gray300: "#d1d5db",
    gray500: "#6b7280",
    gray700: "#374151",
    gray900: "#111827",
  },
  font: "'Manrope', sans-serif",
} as const;

export type Theme = typeof theme;
