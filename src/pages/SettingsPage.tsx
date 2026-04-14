import { useAuth } from "@/context/AuthContext";
import { DASHBOARD_WIDGETS, DEFAULT_WIDGET_PREFS } from "@/types";
import type { DashboardWidgetKey, DashboardWidgetPrefs } from "@/types";
import { t, card } from "@/styles/theme";

export function SettingsPage() {
  const { profile, updateProfile } = useAuth();
  const prefs: DashboardWidgetPrefs = profile?.dashboardWidgets ?? { ...DEFAULT_WIDGET_PREFS };

  function toggle(key: DashboardWidgetKey) {
    updateProfile({ dashboardWidgets: { ...prefs, [key]: !prefs[key] } });
  }

  return (
    <div style={{ display: "grid", gap: t.sectionGap }}>
      <div>
        <span style={{ ...t.eyebrow, color: t.gold, display: "block", marginBottom: "8px" }}>
          PREFERENCES
        </span>
        <h1 style={{ ...t.pageTitle, color: t.text }}>Settings</h1>
      </div>

      <div style={card}>
        <h2 style={{ ...t.sectionHeader, color: t.text, marginBottom: "16px" }}>
          Dashboard Widgets
        </h2>
        <p style={{ ...t.body, color: t.textTertiary, marginBottom: "20px" }}>
          Choose which widgets appear on your dashboard.
        </p>

        <div style={{ display: "grid", gap: "2px" }}>
          {(Object.keys(DASHBOARD_WIDGETS) as DashboardWidgetKey[]).map((key) => (
            <label
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 8px",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ ...t.body, color: t.text }}>
                {DASHBOARD_WIDGETS[key]}
              </span>
              <span
                role="switch"
                aria-checked={prefs[key]}
                onClick={(e) => { e.preventDefault(); toggle(key); }}
                style={{
                  position: "relative",
                  width: "42px",
                  height: "24px",
                  borderRadius: "12px",
                  background: prefs[key] ? t.teal : t.borderMedium,
                  transition: "background 0.2s",
                  flexShrink: 0,
                  cursor: "pointer",
                }}
              >
                <span style={{
                  position: "absolute",
                  top: "2px",
                  left: prefs[key] ? "20px" : "2px",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: "#fff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                  transition: "left 0.2s",
                }} />
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
