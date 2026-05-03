import { useState, useRef } from "react";
import { doc, setDoc, updateDoc, collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { slugify } from "@/lib/slugify";
import { uploadBrokerageLogo } from "@/lib/storage";
import { defaultBrandTokens } from "@/types";
import { t, card, btnPrimary, btnSecondary, inputBase } from "@/styles/theme";
import type { CSSProperties } from "react";

interface BrokerageSetupModalProps {
  onComplete: () => void;
}

export function BrokerageSetupModal({ onComplete }: BrokerageSetupModalProps) {
  const { user, profile, updateProfile, refreshProfile, signOut } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [brokerageName, setBrokerageName] = useState("");
  const [agentTitle, setAgentTitle] = useState("Real Estate Agent");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const trapRef = useFocusTrap({ active: true });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !profile) return;
    if (!brokerageName.trim()) {
      setError("Brokerage name is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Generate slug and check uniqueness
      let slug = slugify(brokerageName);
      const slugQ = query(
        collection(db, "brokerages"),
        where("slug", "==", slug),
        limit(1),
      );
      const slugSnap = await getDocs(slugQ);
      if (!slugSnap.empty) {
        slug = `${slug}-${Date.now()}`;
      }

      // Create brokerage doc
      const brokerageRef = doc(collection(db, "brokerages"));
      const brokerageId = brokerageRef.id;

      const agentName = displayName.trim() || profile.displayName || "";

      await setDoc(brokerageRef, {
        name: brokerageName.trim(),
        slug,
        agentName,
        agentTitle: agentTitle.trim(),
        agentEmail: profile.email || "",
        agentPhone: phone.trim(),
        licenseNumber: licenseNumber.trim(),
        logoUrl: "",
        brandTokens: { ...defaultBrandTokens },
        createdAt: Date.now(),
      });

      // Upload logo if one was selected
      if (logoFile) {
        try {
          const logoUrl = await uploadBrokerageLogo(brokerageId, logoFile);
          await updateDoc(brokerageRef, { logoUrl });
        } catch (logoErr) {
          console.warn("Logo upload failed (non-blocking):", logoErr);
        }
      }

      // Update agent's user doc with new brokerageId
      await updateDoc(doc(db, "users", user.uid), { brokerageId });

      // Update local profile state — refresh to pick up new brokerageId
      const profileUpdates: Record<string, string> = {};
      if (agentName) profileUpdates.displayName = agentName;
      if (phone.trim()) profileUpdates.phone = phone.trim();
      if (Object.keys(profileUpdates).length) await updateProfile(profileUpdates as Parameters<typeof updateProfile>[0]);
      await refreshProfile();

      onComplete();
    } catch (err: unknown) {
      console.error("Brokerage setup failed:", err);
      const code = (err as { code?: string })?.code || "";
      const msg = err instanceof Error ? err.message : String(err);
      if (code === "permission-denied") {
        setError("Firestore permission denied — your user profile may be missing the agent role. Check the browser console for details.");
      } else {
        setError(`Failed to create brokerage: ${code || msg}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.overlay} aria-hidden="true">
      <div ref={trapRef} role="dialog" aria-modal="true" aria-labelledby="brokerage-setup-title" style={styles.modal}>
        <div style={{ textAlign: "center" as const, marginBottom: "24px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "50%",
            background: t.tealLight, display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 16px",
            fontSize: "24px", color: t.teal,
          }}>
            &#x1F3E2;
          </div>
          <h2 id="brokerage-setup-title" style={{ ...t.sectionHeader, color: t.text, marginBottom: "4px" }}>
            Set Up Your Brokerage
          </h2>
          <p style={{ ...t.body, color: t.textSecondary }}>
            Let's get your brokerage set up so your clients see the right info.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label style={styles.label}>Your Name *</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Toni Schafer"
                style={inputBase}
                required
                autoFocus
              />
            </div>

            <div>
              <label style={styles.label}>Brokerage Name *</label>
              <input
                type="text"
                value={brokerageName}
                onChange={(e) => setBrokerageName(e.target.value)}
                placeholder="e.g. Life Built in Kentucky"
                style={inputBase}
                required
              />
            </div>

            <div>
              <label style={styles.label}>Your Title</label>
              <input
                type="text"
                value={agentTitle}
                onChange={(e) => setAgentTitle(e.target.value)}
                placeholder="Real Estate Agent"
                style={inputBase}
              />
            </div>

            <div>
              <label style={styles.label}>License Number</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="Optional"
                style={inputBase}
              />
            </div>

            <div>
              <label style={styles.label}>Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Optional"
                style={inputBase}
              />
            </div>

            <div>
              <label style={styles.label}>Logo (optional)</label>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    style={{ width: "48px", height: "48px", objectFit: "contain", borderRadius: "6px", border: `1px solid ${t.border}` }}
                  />
                ) : (
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "6px",
                    border: `1px dashed ${t.border}`, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    color: t.textTertiary, fontSize: "11px",
                  }}>
                    None
                  </div>
                )}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (!file.type.startsWith("image/")) {
                        setError("Please select an image file.");
                        return;
                      }
                      if (file.size > 2 * 1024 * 1024) {
                        setError("Image must be under 2 MB.");
                        return;
                      }
                      setLogoFile(file);
                      setLogoPreview(URL.createObjectURL(file));
                      setError("");
                    }}
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ ...btnSecondary, fontSize: "12px", padding: "5px 12px" }}
                  >
                    {logoFile ? "Change" : "Choose File"}
                  </button>
                  <p style={{ ...t.caption, color: t.textTertiary, marginTop: "2px", fontSize: "11px" }}>
                    Max 2 MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div style={{
              background: t.rustLight,
              border: `1px solid rgba(174, 64, 37, 0.15)`,
              borderRadius: "8px",
              padding: "10px 12px",
              marginBottom: "16px",
            }}>
              <p role="alert" style={{ ...t.caption, color: t.rust }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !brokerageName.trim() || !displayName.trim()}
            style={{
              ...btnPrimary,
              width: "100%",
              opacity: loading || !brokerageName.trim() || !displayName.trim() ? 0.6 : 1,
              cursor: loading || !brokerageName.trim() || !displayName.trim() ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating..." : "Create Brokerage"}
          </button>
        </form>

        <button
          type="button"
          onClick={signOut}
          style={{
            background: "none",
            border: "none",
            color: t.textTertiary,
            fontSize: "13px",
            cursor: "pointer",
            padding: "8px 0 0",
            width: "100%",
            textAlign: "center" as const,
            fontFamily: t.font,
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    padding: "16px",
  },
  modal: {
    ...card,
    maxWidth: "440px",
    width: "100%",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "12px",
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
    color: "#66645d",
    fontFamily: "'Manrope', sans-serif",
  },
};
