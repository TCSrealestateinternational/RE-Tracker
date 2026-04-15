export const t = {
  // ── Brand (MD3 forest green primary) ──
  teal: "#4f6c4b",
  tealLight: "rgba(79, 108, 75, 0.06)",
  tealMuted: "rgba(79, 108, 75, 0.5)",
  rust: "#ae4025",
  rustLight: "rgba(174, 64, 37, 0.08)",
  gold: "#6e6353",
  goldLight: "rgba(110, 99, 83, 0.08)",

  // ── MD3 Containers ──
  primaryContainer: "#cbecc2",
  primaryDim: "#3a5436",
  secondary: "#536350",
  secondaryContainer: "#d6e8d0",
  tertiaryContainer: "#f5dfbc",
  surfaceContainerLow: "#f7f3eb",
  surfaceContainer: "#f1eee5",
  surfaceContainerHigh: "#ebe8e0",
  surfaceContainerHighest: "#e5e2da",
  outline: "#73796e",
  outlineVariant: "#c3c8bb",

  // ── Surfaces ──
  bg: "#fffbff",
  surface: "#fffbff",
  surfaceHover: "#f7f3eb",
  sidebar: "#f1eee5",
  sidebarHover: "rgba(79, 108, 75, 0.04)",
  sidebarActive: "rgba(79, 108, 75, 0.07)",

  // ── Typography ──
  text: "#393831",
  textSecondary: "#66645d",
  textTertiary: "#828178",
  textInverse: "#ffffff",

  // ── Borders ──
  border: "rgba(0, 0, 0, 0.06)",
  borderMedium: "rgba(0, 0, 0, 0.10)",

  // ── Semantic ──
  success: "#1d6640",
  successLight: "rgba(45, 122, 79, 0.08)",

  // ── Shadows ──
  cardShadow: "0 1px 3px rgba(0,0,0,0.04)",
  cardShadowHover: "0 8px 24px rgba(0,0,0,0.06)",
  heroShadow: "0 20px 40px rgba(21,30,22,0.04)",
  editorialShadow: "0 10px 30px -10px rgba(28, 28, 25, 0.04)",
  deepShadow: "0 32px 64px -12px rgba(28,28,25,0.04)",
  headerBlur: "rgba(255, 251, 255, 0.7)",

  // ── Focus ──
  focusRing: "0 0 0 2px #ffffff, 0 0 0 4px #4f6c4b",

  // ── Spacing ──
  cardPadding: "24px",
  cardRadius: "16px",
  sectionGap: "28px",

  // ── Gradients ──
  goldGradient: "linear-gradient(135deg, #4f6c4b 0%, #6a8a65 100%)",

  // ── Typography scale ──
  font: "'Manrope', sans-serif",
  fontHeadline: "'Noto Serif', serif",
  pageTitle: {
    fontSize: "36px",
    fontWeight: 400,
    lineHeight: 1.2,
    fontFamily: "'Noto Serif', serif",
    fontStyle: "italic" as const,
  },
  sectionHeader: { fontSize: "16px", fontWeight: 600, lineHeight: 1.4 },
  body: { fontSize: "14px", fontWeight: 400, lineHeight: 1.55 },
  label: {
    fontSize: "12px",
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
  },
  eyebrow: {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
    fontFamily: "'Manrope', sans-serif",
  },
  microLabel: {
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
  },
  caption: { fontSize: "12px", fontWeight: 400, lineHeight: 1.4 },
  stat: {
    fontSize: "36px",
    fontWeight: 400,
    lineHeight: 1.1,
    fontFamily: "'Noto Serif', serif",
    fontStyle: "italic" as const,
  },
  // ── Breakpoints ──
  breakpoints: { mobile: 768, tablet: 1024 },
} as const;

// ── Shared styles ──
export const card = {
  background: t.surface,
  borderRadius: t.cardRadius,
  border: `1px solid ${t.border}`,
  padding: t.cardPadding,
  boxShadow: t.editorialShadow,
  transition: "box-shadow 0.2s, transform 0.2s",
} as const;

export const cardElevated = {
  ...card,
  boxShadow: t.deepShadow,
} as const;

export const inputBase = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "12px",
  border: `1px solid ${t.borderMedium}`,
  fontSize: "14px",
  fontFamily: t.font,
  color: t.text,
  background: t.surface,
  boxSizing: "border-box" as const,
  transition: "border-color 0.15s",
} as const;

export const btnPrimary = {
  padding: "10px 20px",
  background: t.teal,
  color: t.textInverse,
  border: "none",
  borderRadius: "12px",
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
  borderRadius: "12px",
  fontSize: "14px",
  fontWeight: 500,
  fontFamily: t.font,
  cursor: "pointer",
} as const;
