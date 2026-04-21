import { useState, useRef } from "react";
import {
  verifyBeforeUpdateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithPopup,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useBrokerage } from "@/hooks/useBrokerage";
import { uploadBrokerageLogo } from "@/lib/storage";
import { DASHBOARD_WIDGETS, DEFAULT_WIDGET_PREFS } from "@/types";
import type { DashboardWidgetKey, DashboardWidgetPrefs } from "@/types";
import { t, card, inputBase, btnPrimary, btnSecondary } from "@/styles/theme";

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

      <ProfileCard />

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

function ProfileCard() {
  const { user, profile, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Email change state
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [emailStatus, setEmailStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [emailSaving, setEmailSaving] = useState(false);

  const isGoogleUser = user?.providerData.some((p) => p.providerId === "google.com") ?? false;
  const isPasswordUser = user?.providerData.some((p) => p.providerId === "password") ?? false;

  async function handleSaveProfile() {
    setSaving(true);
    setSaved(false);
    await updateProfile({
      displayName: displayName.trim(),
      phone: phone.trim(),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newEmail.trim()) return;

    setEmailSaving(true);
    setEmailStatus(null);

    try {
      // Re-authenticate first
      if (isPasswordUser) {
        if (!currentPassword) {
          setEmailStatus({ type: "error", message: "Please enter your current password." });
          setEmailSaving(false);
          return;
        }
        const credential = EmailAuthProvider.credential(user.email!, currentPassword);
        await reauthenticateWithCredential(user, credential);
      } else if (isGoogleUser) {
        await reauthenticateWithPopup(user, new GoogleAuthProvider());
      }

      // Send verification to new email
      await verifyBeforeUpdateEmail(user, newEmail.trim());

      // Update the email in Firestore too (will reflect after verification)
      await updateDoc(doc(db, "users", user.uid), { pendingEmail: newEmail.trim() });

      setEmailStatus({
        type: "success",
        message: `Verification email sent to ${newEmail.trim()}. Check your inbox and click the link to confirm the change.`,
      });
      setNewEmail("");
      setCurrentPassword("");
      setShowEmailChange(false);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setEmailStatus({ type: "error", message: "Incorrect password. Please try again." });
      } else if (code === "auth/email-already-in-use") {
        setEmailStatus({ type: "error", message: "That email is already associated with another account." });
      } else if (code === "auth/invalid-email") {
        setEmailStatus({ type: "error", message: "Please enter a valid email address." });
      } else if (code === "auth/too-many-requests") {
        setEmailStatus({ type: "error", message: "Too many attempts. Please wait a few minutes and try again." });
      } else {
        setEmailStatus({ type: "error", message: err instanceof Error ? err.message : "Failed to update email." });
      }
    } finally {
      setEmailSaving(false);
    }
  }

  const labelStyle = {
    display: "block" as const,
    marginBottom: "6px",
    ...t.label,
    color: t.textSecondary,
  };

  return (
    <div style={card}>
      <h2 style={{ ...t.sectionHeader, color: t.text, marginBottom: "16px" }}>Profile</h2>

      <div style={{ display: "grid", gap: "14px", marginBottom: "16px" }}>
        <div>
          <label style={labelStyle}>Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            style={inputBase}
          />
        </div>
        <div>
          <label style={labelStyle}>Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Optional"
            style={inputBase}
          />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}>
            <span style={{ ...t.body, color: t.text }}>{user?.email ?? "—"}</span>
            <button
              type="button"
              onClick={() => { setShowEmailChange(!showEmailChange); setEmailStatus(null); }}
              style={{
                ...btnSecondary,
                padding: "4px 12px",
                fontSize: "12px",
              }}
            >
              {showEmailChange ? "Cancel" : "Change"}
            </button>
          </div>
        </div>
      </div>

      {/* Email change form */}
      {showEmailChange && (
        <form
          onSubmit={handleEmailChange}
          style={{
            background: t.surfaceContainer,
            borderRadius: "10px",
            padding: "16px",
            marginBottom: "16px",
            display: "grid",
            gap: "12px",
          }}
        >
          <div>
            <label style={labelStyle}>New Email Address</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new@example.com"
              required
              style={inputBase}
              autoFocus
            />
          </div>
          {isPasswordUser && (
            <div>
              <label style={labelStyle}>Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Required to verify your identity"
                required
                style={inputBase}
              />
            </div>
          )}
          {isGoogleUser && !isPasswordUser && (
            <p style={{ ...t.caption, color: t.textTertiary }}>
              You'll be prompted to re-authenticate with Google.
            </p>
          )}
          <button
            type="submit"
            disabled={emailSaving || !newEmail.trim()}
            style={{
              ...btnPrimary,
              opacity: emailSaving || !newEmail.trim() ? 0.6 : 1,
              cursor: emailSaving || !newEmail.trim() ? "not-allowed" : "pointer",
              justifySelf: "start",
            }}
          >
            {emailSaving ? "Sending verification..." : "Send Verification Email"}
          </button>
        </form>
      )}

      {/* Email change status message */}
      {emailStatus && (
        <div
          role="alert"
          style={{
            background: emailStatus.type === "success" ? t.tealLight : t.rustLight,
            color: emailStatus.type === "success" ? t.teal : t.rust,
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "16px",
            ...t.caption,
          }}
        >
          {emailStatus.message}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          style={{
            ...btnPrimary,
            opacity: saving ? 0.6 : 1,
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
        {saved && (
          <span style={{ ...t.caption, color: t.success, fontWeight: 600 }}>Saved</span>
        )}
      </div>
    </div>
  );
}

function BrokerageCard({
  brokerage,
  loading,
  onSave,
}: {
  brokerage: { id?: string; name: string; agentTitle: string; licenseNumber: string; agentPhone: string; logoUrl?: string } | null;
  loading: boolean;
  onSave: (data: Record<string, string>) => Promise<void>;
}) {
  const [name, setName] = useState(brokerage?.name ?? "");
  const [agentTitle, setAgentTitle] = useState(brokerage?.agentTitle ?? "");
  const [license, setLicense] = useState(brokerage?.licenseNumber ?? "");
  const [phone, setPhone] = useState(brokerage?.agentPhone ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoError, setLogoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync local state when brokerage loads
  if (!loading && brokerage && !name && brokerage.name) {
    setName(brokerage.name);
    setAgentTitle(brokerage.agentTitle);
    setLicense(brokerage.licenseNumber);
    setPhone(brokerage.agentPhone);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !brokerage?.id) return;

    if (!file.type.startsWith("image/")) {
      setLogoError("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError("Image must be under 2 MB.");
      return;
    }

    setLogoError("");
    setUploading(true);
    try {
      const downloadUrl = await uploadBrokerageLogo(brokerage.id, file);
      await onSave({ logoUrl: downloadUrl });
    } catch (err) {
      console.error("Logo upload failed:", err);
      setLogoError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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

      {/* Logo upload */}
      <div style={{ marginBottom: "16px" }}>
        <label style={labelStyle}>Logo</label>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {brokerage?.logoUrl ? (
            <img
              src={brokerage.logoUrl}
              alt="Brokerage logo"
              style={{ width: "64px", height: "64px", objectFit: "contain", borderRadius: "8px", border: `1px solid ${t.border}` }}
            />
          ) : (
            <div style={{
              width: "64px", height: "64px", borderRadius: "8px",
              border: `1px dashed ${t.border}`, display: "flex",
              alignItems: "center", justifyContent: "center",
              color: t.textTertiary, fontSize: "12px",
            }}>
              No logo
            </div>
          )}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                ...btnSecondary,
                fontSize: "13px",
                padding: "6px 14px",
                opacity: uploading ? 0.6 : 1,
              }}
            >
              {uploading ? "Uploading..." : "Upload Logo"}
            </button>
            <p style={{ ...t.caption, color: t.textTertiary, marginTop: "4px" }}>
              Max 2 MB. PNG or JPG recommended.
            </p>
          </div>
        </div>
        {logoError && (
          <p style={{ ...t.caption, color: t.rust, marginTop: "6px" }}>{logoError}</p>
        )}
      </div>

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
