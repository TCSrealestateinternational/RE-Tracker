import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, addDoc, collection } from "firebase/firestore";
import { secondaryAuth } from "@/lib/firebase-secondary";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { t, btnPrimary, btnSecondary, card } from "@/styles/theme";
import type { Client } from "@/types";
import type { CSSProperties } from "react";

interface AddToHearthModalProps {
  client: Client;
  onClose: () => void;
  onLinked: (hearthUserId: string) => void;
}

export function AddToHearthModal({ client, onClose, onLinked }: AddToHearthModalProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const needsEmail = !client.email;

  async function handleAdd() {
    if (!profile || !client.email) return;
    setError("");
    setLoading(true);

    try {
      const brokerageId = profile.brokerageId;

      // 1. Create Firebase Auth account via secondary auth (doesn't log out agent)
      const placeholder = crypto.randomUUID() + "!Aa1";
      const cred = await createUserWithEmailAndPassword(
        secondaryAuth,
        client.email,
        placeholder
      );

      await updateProfile(cred.user, { displayName: client.name });

      // 2. Create Hearth user doc in shared users collection
      const isBuyer = client.status === "buyer";
      const roles = isBuyer ? ["buyer"] : ["seller"];
      const userData: Record<string, unknown> = {
        brokerageId,
        agentId: profile.id,
        email: client.email,
        displayName: client.name,
        roles,
        status: "pending",
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      };
      if (client.phone) userData.phone = client.phone;

      await setDoc(doc(db, "users", cred.user.uid), userData);

      // 3. Create Hearth transaction
      await addDoc(collection(db, "transactions"), {
        brokerageId,
        agentId: profile.id,
        clientId: cred.user.uid,
        type: isBuyer ? "buying" : "selling",
        status: "active",
        label: `${client.name} - ${isBuyer ? "Buying" : "Selling"}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 4. Sign out secondary auth
      await signOut(secondaryAuth);

      // 5. Send password reset email as invite
      const appUrl = typeof window !== "undefined" ? window.location.origin : "";
      await sendPasswordResetEmail(auth, client.email, {
        url: `${appUrl}/login`,
        handleCodeInApp: false,
      });

      setSuccess(true);
      onLinked(cred.user.uid);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "";
      if (raw.includes("email-already-in-use")) {
        setError("This email already has a Hearth account. The client may already be in the portal.");
      } else if (raw.includes("invalid-email")) {
        setError("Please go back and enter a valid email address for this client.");
      } else if (raw.includes("network-request-failed")) {
        setError("Network error. Please check your connection and try again.");
      } else {
        console.error("Hearth account creation failed:", err);
        setError("Something went wrong. Please try again or contact support.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {success ? (
          <>
            <div style={styles.successIcon}>&#10003;</div>
            <h2 style={{ ...t.sectionHeader, color: t.text, textAlign: "center" as const, marginBottom: "8px" }}>
              Invite Sent!
            </h2>
            <p style={{ ...t.body, color: t.textSecondary, textAlign: "center" as const, marginBottom: "8px" }}>
              A setup email has been sent to:
            </p>
            <p style={{ ...t.body, color: t.teal, fontWeight: 600, textAlign: "center" as const, marginBottom: "20px" }}>
              {client.email}
            </p>
            <p style={{ ...t.caption, color: t.textSecondary, textAlign: "center" as const, marginBottom: "20px" }}>
              Once they set their password, they&apos;ll have access to their Hearth portal
              where they can view transaction progress, message you, and track their journey.
            </p>
            <button onClick={onClose} style={{ ...btnPrimary, width: "100%" }}>
              Done
            </button>
          </>
        ) : (
          <>
            <h2 style={{ ...t.sectionHeader, color: t.text, marginBottom: "4px" }}>
              Also add to Hearth?
            </h2>
            <p style={{ ...t.body, color: t.textSecondary, marginBottom: "16px" }}>
              Give <strong>{client.name}</strong> access to their own client portal.
            </p>

            {/* Explanation box */}
            <div style={styles.infoBox}>
              <div style={{ fontSize: "18px", marginBottom: "8px" }}>&#x1f517;</div>
              <p style={{ ...t.body, color: t.text, fontWeight: 600, marginBottom: "6px" }}>
                Linked accounts — no duplicate data
              </p>
              <p style={{ ...t.caption, color: t.textSecondary, lineHeight: "1.5" }}>
                This client&apos;s information will be linked between RE Tracker and Hearth
                so you only manage it in one place. Updates in either app stay in sync.
                Your client will receive an email invite to set up their password and
                access their portal immediately.
              </p>
            </div>

            {/* What the client gets */}
            <div style={{ marginBottom: "16px" }}>
              <p style={{ ...t.caption, ...t.label, color: t.textSecondary, marginBottom: "8px" }}>
                Your client will get:
              </p>
              <ul style={styles.featureList}>
                <li>Transaction progress & milestones</li>
                <li>Direct messaging with you</li>
                <li>{client.status === "buyer" ? "Property tracking & finance calculator" : "Listing details & offer tracker"}</li>
                <li>Guided checklist for their journey</li>
              </ul>
            </div>

            {needsEmail && (
              <div style={styles.warningBox}>
                <p style={{ ...t.caption, color: t.rust }}>
                  This client doesn&apos;t have an email address. Go back and add one first — it&apos;s needed to send the invite.
                </p>
              </div>
            )}

            {error && (
              <div style={styles.warningBox}>
                <p style={{ ...t.caption, color: t.rust }}>{error}</p>
              </div>
            )}

            <div style={styles.actions}>
              <button onClick={onClose} style={btnSecondary}>
                Not now
              </button>
              <button
                onClick={handleAdd}
                disabled={loading || needsEmail}
                style={{
                  ...btnPrimary,
                  opacity: loading || needsEmail ? 0.6 : 1,
                  cursor: loading || needsEmail ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Sending invite..." : "Add & Send Invite"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "16px",
  },
  modal: {
    ...card,
    maxWidth: "440px",
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto" as const,
  },
  infoBox: {
    background: t.tealLight,
    border: `1px solid rgba(12, 65, 78, 0.12)`,
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "16px",
    textAlign: "center" as const,
  },
  featureList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
    fontSize: "13px",
    color: t.textSecondary,
  },
  warningBox: {
    background: t.rustLight,
    border: `1px solid rgba(157, 68, 42, 0.15)`,
    borderRadius: "8px",
    padding: "10px 12px",
    marginBottom: "16px",
  },
  successIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: t.successLight,
    color: t.success,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: 700,
    margin: "0 auto 16px",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
  },
};
