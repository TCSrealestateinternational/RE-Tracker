export const t = {
  // ── Brand (used sparingly) ──
  teal: "#0c414e",
  tealLight: "rgba(12, 65, 78, 0.06)",
  tealMuted: "rgba(12, 65, 78, 0.5)",
  rust: "#9d442a",
  rustLight: "rgba(157, 68, 42, 0.08)",
  gold: "#bc804d",
  goldLight: "rgba(188, 128, 77, 0.08)",

  // ── Surfaces ──
  bg: "#f5f0eb",           // warm cream — page background
  surface: "#ffffff",       // card surface
  surfaceHover: "#faf8f5",  // subtle hover
  sidebar: "#f8f5f1",       // muted warm off-white
  sidebarHover: "rgba(12, 65, 78, 0.04)",
  sidebarActive: "rgba(12, 65, 78, 0.07)",

  // ── Typography ──
  text: "#1a1a1a",
  textSecondary: "#6b6560",
  textTertiary: "#9b9590",
  textInverse: "#ffffff",

  // ── Borders ──
  border: "rgba(0, 0, 0, 0.06)",
  borderMedium: "rgba(0, 0, 0, 0.10)",

  // ── Semantic ──
  success: "#2d7a4f",
  successLight: "rgba(45, 122, 79, 0.08)",

  // ── Shadows ──
  cardShadow: "0 1px 3px rgba(0,0,0,0.04)",
  cardShadowHover: "0 8px 24px rgba(0,0,0,0.06)",
  heroShadow: "0 20px 40px rgba(21,30,22,0.04)",
  headerBlur: "rgba(245, 240, 235, 0.8)",

  // ── Spacing ──
  cardPadding: "24px",
  cardRadius: "10px",
  sectionGap: "28px",

  // ── Typography scale ──
  font: "'Manrope', sans-serif",
  pageTitle: { fontSize: "22px", fontWeight: 700, lineHeight: 1.3 },
  sectionHeader: { fontSize: "16px", fontWeight: 600, lineHeight: 1.4 },
  body: { fontSize: "14px", fontWeight: 400, lineHeight: 1.55 },
  label: {
    fontSize: "12px",
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
  },
  caption: { fontSize: "12px", fontWeight: 400, lineHeight: 1.4 },
  stat: { fontSize: "28px", fontWeight: 700, lineHeight: 1.1 },
  // ── Breakpoints ──
  breakpoints: { mobile: 768, tablet: 1024 },
} as const;

// ── Shared styles ──
export const card = {
  background: t.surface,
  borderRadius: t.cardRadius,
  border: `1px solid ${t.border}`,
  padding: t.cardPadding,
  boxShadow: t.cardShadow,
  transition: "box-shadow 0.2s, transform 0.2s",
} as const;

export const inputBase = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: `1px solid ${t.borderMedium}`,
  fontSize: "14px",
  fontFamily: t.font,
  color: t.text,
  background: t.surface,
  outline: "none",
  boxSizing: "border-box" as const,
  transition: "border-color 0.15s",
} as const;

export const btnPrimary = {
  padding: "10px 20px",
  background: t.teal,
  color: t.textInverse,
  border: "none",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: 600,
  fontFamily: t.font,
  cursor: "pointer",
} as const;

export const btnSecondary = {
  padding: "10px 20px",
  background: "transparent",
  color: t.textSecondary,
  border: `1px solid ${t.borderMedium}`,
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: 500,
  fontFamily: t.font,
  cursor: "pointer",
} as const;
