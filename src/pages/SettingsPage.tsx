import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useBrokerage } from "@/hooks/useBrokerage";
import { DASHBOARD_WIDGETS, DEFAULT_WIDGET_PREFS } from "@/types";
import type { DashboardWidgetKey, DashboardWidgetPrefs } from "@/types";
import { t, card, inputBase, btnPrimary } from "@/styles/theme";

export function SettingsPage() {
  const { profile, updateProfile } = useAuth();
  const prefs: DashboardWidgetPrefs = profile?.dashboardWidgets ?? { ...DEFAULT_WIDGET_PREFS };
  const { brokerage, loading: brokerageLoading, updateBrokerage } = useBrokerage();

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

      {/* ── Brokerage Settings ── */}
      {profile?.brokerageId && (
        <BrokerageCard
          brokerage={brokerage}
          loading={brokerageLoading}
          onSave={updateBrokerage}
        />
      )}
    </div>
  );
}

function BrokerageCard({
  brokerage,
  loading,
  onSave,
}: {
  brokerage: { name: string; agentTitle: string; licenseNumber: string; agentPhone: string } | null;
  loading: boolean;
  onSave: (data: Record<string, string>) => Promise<void>;
}) {
  const [name, setName] = useState(brokerage?.name ?? "");
  const [agentTitle, setAgentTitle] = useState(brokerage?.agentTitle ?? "");
  const [license, setLicense] = useState(brokerage?.licenseNumber ?? "");
  const [phone, setPhone] = useState(brokerage?.agentPhone ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync local state when brokerage loads
  if (!loading && brokerage && !name && brokerage.name) {
    setName(brokerage.name);
    setAgentTitle(brokerage.agentTitle);
    setLicense(brokerage.licenseNumber);
    setPhone(brokerage.agentPhone);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await onSave({
      name: name.trim(),
      agentTitle: agentTitle.trim(),
      licenseNumber: license.trim(),
      agentPhone: phone.trim(),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return (
      <div style={card}>
        <h2 style={{ ...t.sectionHeader, color: t.text }}>Brokerage</h2>
        <p style={{ ...t.body, color: t.textTertiary, marginTop: "8px" }}>Loading...</p>
      </div>
    );
  }

  const labelStyle = {
    display: "block" as const,
    marginBottom: "6px",
    ...t.label,
    color: t.textSecondary,
  };

  return (
    <div style={card}>
      <h2 style={{ ...t.sectionHeader, color: t.text, marginBottom: "16px" }}>Brokerage</h2>

      <div style={{ display: "grid", gap: "14px", marginBottom: "16px" }}>
        <div>
          <label style={labelStyle}>Brokerage Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputBase}
          />
        </div>
        <div>
          <label style={labelStyle}>Agent Title</label>
          <input
            type="text"
            value={agentTitle}
            onChange={(e) => setAgentTitle(e.target.value)}
            style={inputBase}
          />
        </div>
        <div>
          <label style={labelStyle}>License Number</label>
          <input
            type="text"
            value={license}
            onChange={(e) => setLicense(e.target.value)}
            style={inputBase}
          />
        </div>
        <div>
          <label style={labelStyle}>Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={inputBase}
          />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            ...btnPrimary,
            opacity: saving ? 0.6 : 1,
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saved && (
          <span style={{ ...t.caption, color: t.success, fontWeight: 600 }}>Saved</span>
        )}
      </div>
    </div>
  );
}
