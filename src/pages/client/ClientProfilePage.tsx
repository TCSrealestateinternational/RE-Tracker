import { useAuth } from "@/context/AuthContext";
import { Icon } from "@/components/shared/Icon";
import { t, card, btnSecondary } from "@/styles/theme";

export function ClientProfilePage() {
  const { profile, signOut } = useAuth();

  const infoRow = (label: string, value: string | undefined | null, icon: string) => {
    if (!value) return null;
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 16px",
        background: t.surfaceContainerLow,
        borderRadius: "12px",
      }}>
        <Icon name={icon} size={18} color={t.textTertiary} />
        <div>
          <div style={{ ...t.label, color: t.textTertiary, marginBottom: "2px" }}>{label}</div>
          <div style={{ ...t.body, color: t.text }}>{value}</div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <h1 style={{ ...t.pageTitle, color: t.text }}>Profile</h1>

      {/* Avatar + name */}
      <section style={{ ...card, display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: t.primaryContainer,
          color: t.teal,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          fontWeight: 700,
          fontFamily: t.font,
          flexShrink: 0,
        }}>
          {profile?.displayName?.slice(0, 2).toUpperCase() || "?"}
        </div>
        <div>
          <h2 style={{ ...t.sectionHeader, color: t.text }}>
            {profile?.displayName || "User"}
          </h2>
          <p style={{ ...t.caption, color: t.textTertiary }}>
            {profile?.roles?.includes("buyer") ? "Home Buyer" : "Home Seller"}
          </p>
        </div>
      </section>

      {/* Contact info */}
      <section style={{ display: "grid", gap: "8px" }} aria-label="Contact information">
        {infoRow("Email", profile?.email, "email")}
        {infoRow("Phone", profile?.phone, "call")}
        {infoRow("Name", profile?.displayName, "person")}
      </section>

      {/* Sign out */}
      <section>
        <button
          onClick={signOut}
          style={{
            ...btnSecondary,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            minHeight: "44px",
          }}
        >
          <Icon name="logout" size={18} />
          Sign Out
        </button>
      </section>
    </div>
  );
}
