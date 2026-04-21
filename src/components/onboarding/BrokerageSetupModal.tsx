import { useState } from "react";
import { doc, setDoc, updateDoc, collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { slugify } from "@/lib/slugify";
import { defaultBrandTokens } from "@/types";
import { t, card, btnPrimary, inputBase } from "@/styles/theme";
import type { CSSProperties } from "react";

interface BrokerageSetupModalProps {
  onComplete: () => void;
}

export function BrokerageSetupModal({ onComplete }: BrokerageSetupModalProps) {
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const [brokerageName, setBrokerageName] = useState("");
  const [agentTitle, setAgentTitle] = useState("Real Estate Agent");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      await setDoc(brokerageRef, {
        name: brokerageName.trim(),
        slug,
        agentName: profile.displayName || "",
        agentTitle: agentTitle.trim(),
        agentEmail: profile.email || "",
        agentPhone: phone.trim(),
        licenseNumber: licenseNumber.trim(),
        logoUrl: "",
        brandTokens: { ...defaultBrandTokens },
        createdAt: Date.now(),
      });

      // Update agent's user doc with new brokerageId
      await updateDoc(doc(db, "users", user.uid), { brokerageId });

      // Update local profile state — refresh to pick up new brokerageId
      if (phone.trim()) await updateProfile({ phone: phone.trim() });
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
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={{ textAlign: "center" as const, marginBottom: "24px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "50%",
            background: t.tealLight, display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 16px",
            fontSize: "24px", color: t.teal,
          }}>
            &#x1F3E2;
          </div>
          <h2 style={{ ...t.sectionHeader, color: t.text, marginBottom: "4px" }}>
            Set Up Your Brokerage
          </h2>
          <p style={{ ...t.body, color: t.textSecondary }}>
            Let's get your brokerage set up so your clients see the right info.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label style={styles.label}>Brokerage Name *</label>
              <input
                type="text"
                value={brokerageName}
                onChange={(e) => setBrokerageName(e.target.value)}
                placeholder="e.g. Life Built in Kentucky"
                style={inputBase}
                required
                autoFocus
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
          </div>

          {error && (
            <div style={{
              background: t.rustLight,
              border: `1px solid rgba(174, 64, 37, 0.15)`,
              borderRadius: "8px",
              padding: "10px 12px",
              marginBottom: "16px",
            }}>
              <p style={{ ...t.caption, color: t.rust }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !brokerageName.trim()}
            style={{
              ...btnPrimary,
              width: "100%",
              opacity: loading || !brokerageName.trim() ? 0.6 : 1,
              cursor: loading || !brokerageName.trim() ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating..." : "Create Brokerage"}
          </button>
        </form>
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
