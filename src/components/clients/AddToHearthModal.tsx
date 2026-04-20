import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, addDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { secondaryAuth } from "@/lib/firebase-secondary";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { t, btnPrimary, btnSecondary, card } from "@/styles/theme";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { getDefaultPermissions, PERMISSION_LABELS } from "@/constants/permissionDefaults";
import type { Client, SyncPermissions, SyncPermissionKey } from "@/types";
import { PLAN_DEFAULTS } from "@/types";
import { BUYER_MILESTONE_MAP, SELLER_MILESTONE_MAP } from "@/constants/milestoneMap";
import type { CSSProperties } from "react";

type WizardStep = "confirm" | "permissions" | "review";

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
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [emailFailed, setEmailFailed] = useState(false);

  // Tracks UID from a partially-completed previous attempt within this session
  const [savedUid, setSavedUid] = useState<string | null>(null);

  // Wizard state
  const [step, setStep] = useState<WizardStep>("confirm");
  const isBuyer = client.status === "buyer";
  const [permissions, setPermissions] = useState<SyncPermissions>(
    getDefaultPermissions(isBuyer ? "buyer" : "seller"),
  );

  const needsEmail = !client.email;
  const dialogRef = useFocusTrap<HTMLDivElement>({ onEscape: onClose });

  function togglePermission(key: SyncPermissionKey) {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const actionCodeSettings = {
    url: "https://hearthapp.vercel.app/login",
    handleCodeInApp: false,
  };

  async function handleResend() {
    if (!client.email) return;
    setResending(true);
    try {
      await sendPasswordResetEmail(auth, client.email, actionCodeSettings);
      setResent(true);
    } catch (err) {
      console.error("Resend failed:", err);
      setError("Could not resend the invite. Please try again.");
    } finally {
      setResending(false);
    }
  }

  function buildPermissionData() {
    return {
      syncPermissions: permissions,
      permissionHistory: [{
        action: "invite_sent" as const,
        timestamp: Date.now(),
        changedBy: profile?.id || "",
      }],
      hearthPortalActive: true,
    };
  }

  async function ensureFirestoreDocs(clientUid: string) {
    if (!profile || !client.email) return;
    const brokerageId = profile.brokerageId;

    const roles = isBuyer ? ["buyer"] : ["seller"];
    const userData: Record<string, unknown> = {
      brokerageId,
      brokerageIds: [brokerageId],
      agentId: profile.id,
      email: client.email,
      displayName: client.name,
      roles,
      status: "pending",
      subscription: {
        plan: "hearth_only",
        status: "active",
        features: { ...PLAN_DEFAULTS.hearth_only },
        trialEndsAt: null,
        billingCycleEnd: null,
      },
    };
    if (client.phone) userData.phone = client.phone;

    await setDoc(doc(db, "users", clientUid), {
      ...userData,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    }, { merge: true });

    const txQ = query(
      collection(db, "transactions"),
      where("clientId", "==", clientUid),
      where("agentId", "==", profile.id),
    );
    const txSnap = await getDocs(txQ);

    if (txSnap.empty) {
      const txRef = await addDoc(collection(db, "transactions"), {
        brokerageId,
        agentId: profile.id,
        clientId: clientUid,
        type: isBuyer ? "buying" : "selling",
        status: "active",
        label: `${client.name} - ${isBuyer ? "Buying" : "Selling"}`,
        ...buildPermissionData(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Seed milestones from milestone map
      const map = isBuyer ? BUYER_MILESTONE_MAP : SELLER_MILESTONE_MAP;
      const batch = writeBatch(db);
      for (const mapping of Object.values(map)) {
        const mRef = doc(collection(db, "transactions", txRef.id, "milestones"));
        batch.set(mRef, {
          label: mapping.label,
          stage: mapping.stage,
          completed: false,
          completedAt: null,
          completedBy: null,
          clientVisible: mapping.defaultClientVisible,
          notifyClient: mapping.defaultNotifyClient,
        });
      }
      await batch.commit();
    }
  }

  async function handleExistingAccount() {
    if (!profile || !client.email) return;
    const brokerageId = profile.brokerageId;

    // Try to find the existing Firestore user doc
    let existingUserId: string | null = null;
    try {
      const userQ = query(
        collection(db, "users"),
        where("email", "==", client.email),
        where("brokerageId", "==", brokerageId),
      );
      const userSnap = await getDocs(userQ);
      if (!userSnap.empty) {
        existingUserId = userSnap.docs[0]!.id;
      }
    } catch (queryErr) {
      // Compound query may fail (missing composite index or permission issue)
      console.warn("User lookup query failed:", queryErr);
    }

    if (existingUserId) {
      // Found the Firestore user — repair & link
      await ensureFirestoreDocs(existingUserId);
      onLinked(existingUserId);

      try {
        await sendPasswordResetEmail(auth, client.email, actionCodeSettings);
      } catch {
        // Non-blocking
      }

      setSuccess(true);
      return;
    }

    // Email exists in Firebase Auth but no Firestore user doc found.
    // This is an orphaned Auth account from a previous failed invite attempt.
    // Send a password reset email so the account is recoverable.
    try {
      await sendPasswordResetEmail(auth, client.email, actionCodeSettings);
    } catch {
      // Non-blocking
    }

    setAlreadyExists(true);
    setError(
      "A previous invite for this email was only partially completed — " +
      "the account exists but isn\u2019t fully set up. We\u2019ve sent a password reset email. " +
      "Click \u201CRetry Setup\u201D below to finish linking this client."
    );
  }

  async function handleRetrySetup() {
    if (!profile || !client.email) return;
    setError("");
    setLoading(true);

    try {
      // Sign into secondaryAuth to get the orphaned user's UID
      // We can't sign in (don't know the password), so we create a fresh
      // password-reset flow. But first, try to find the UID via Firestore.
      // If the user already has a hearthUserId saved, use that directly.
      const knownUid = savedUid || client.hearthUserId;
      if (knownUid) {
        await ensureFirestoreDocs(knownUid);
        onLinked(knownUid);
        try { await sendPasswordResetEmail(auth, client.email, actionCodeSettings); } catch { /* non-blocking */ }
        setSuccess(true);
        return;
      }

      // No saved UID — the orphaned Auth user's UID is unknown.
      // Delete via secondary auth isn't possible without signing in.
      // Best we can do: tell the agent to delete the orphan from Firebase Console.
      setError(
        "We couldn\u2019t recover the incomplete account automatically. " +
        "Please go to Firebase Console \u2192 Authentication \u2192 Users, " +
        "search for \"" + client.email + "\", delete that entry, " +
        "then come back and try Send Invite again."
      );
    } catch (err) {
      console.error("Retry setup failed:", err);
      setError("Recovery failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!profile || !client.email) return;
    setError("");
    setLoading(true);

    try {
      // If we already have the UID (from a partial attempt), skip Auth creation
      let clientUid = savedUid || client.hearthUserId;

      if (!clientUid) {
        const placeholder = crypto.randomUUID() + "!Aa1";
        const cred = await createUserWithEmailAndPassword(
          secondaryAuth,
          client.email,
          placeholder
        );
        clientUid = cred.user.uid;

        await updateProfile(cred.user, { displayName: client.name });
        await signOut(secondaryAuth);

        // Persist the UID immediately so retries can recover
        setSavedUid(clientUid);
      }

      // Create/update Firestore user doc & transaction (idempotent)
      await ensureFirestoreDocs(clientUid);

      onLinked(clientUid);

      try {
        await sendPasswordResetEmail(auth, client.email, actionCodeSettings);
      } catch (emailErr) {
        console.error("Invite email failed:", emailErr);
        setEmailFailed(true);
      }

      setSuccess(true);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "";
      if (raw.includes("email-already-in-use")) {
        try {
          await handleExistingAccount();
        } catch (linkErr) {
          console.error("Failed to link existing account:", linkErr);
          setAlreadyExists(true);
          setError("Could not link this email. See console for details.");
        }
      } else if (raw.includes("invalid-email")) {
        setError("Please go back and enter a valid email address for this client.");
      } else if (raw.includes("network-request-failed")) {
        setError("Network error. Please check your connection and try again.");
      } else {
        console.error("Hearth account creation failed:", raw, err);
        setError("Something went wrong. Please try again or contact support.");
      }
    } finally {
      setLoading(false);
    }
  }

  const permissionKeys = Object.keys(PERMISSION_LABELS) as SyncPermissionKey[];

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="hearth-modal-title" style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {success ? (
          <>
            <div style={styles.successIcon}>&#10003;</div>
            <h2 id="hearth-modal-title" style={{ ...t.sectionHeader, color: t.text, textAlign: "center" as const, marginBottom: "8px" }}>
              {emailFailed ? "Account Created" : "Invite Sent!"}
            </h2>
            {emailFailed ? (
              <div style={{ ...styles.warningBox, marginBottom: "16px", textAlign: "center" as const }}>
                <p style={{ ...t.caption, color: t.rust, marginBottom: "8px" }}>
                  Account created, but the invite email may not have sent. You can resend it below.
                </p>
                <button
                  onClick={handleResend}
                  disabled={resending || resent}
                  style={{
                    ...btnSecondary,
                    fontSize: "12px",
                    padding: "6px 14px",
                    opacity: resending ? 0.6 : 1,
                  }}
                >
                  {resending ? "Sending..." : resent ? "Invite Resent" : "Resend Invite Email"}
                </button>
              </div>
            ) : (
              <>
                <p style={{ ...t.body, color: t.textSecondary, textAlign: "center" as const, marginBottom: "8px" }}>
                  A setup email has been sent to:
                </p>
                <p style={{ ...t.body, color: t.teal, fontWeight: 600, textAlign: "center" as const, marginBottom: "20px" }}>
                  {client.email}
                </p>
              </>
            )}
            <p style={{ ...t.caption, color: t.textSecondary, textAlign: "center" as const, marginBottom: "12px" }}>
              Once they set their password, they&apos;ll have access to their Hearth portal
              where they can view transaction progress, message you, and track their journey.
            </p>
            <div style={{ ...styles.infoBox, background: t.bg, border: `1px solid ${t.border}` }}>
              <p style={{ ...t.caption, color: t.textSecondary, marginBottom: "4px", fontWeight: 600 }}>
                Permissions set:
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {permissionKeys.map((key) => (
                  <span key={key} style={{
                    padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 500,
                    background: permissions[key] ? t.tealLight : t.rustLight,
                    color: permissions[key] ? t.teal : t.rust,
                  }}>
                    {permissions[key] ? "+" : "-"} {PERMISSION_LABELS[key].label}
                  </span>
                ))}
              </div>
            </div>
            <button onClick={onClose} style={{ ...btnPrimary, width: "100%", marginTop: "16px" }}>
              Done
            </button>
          </>
        ) : step === "confirm" ? (
          <>
            {/* Step indicator */}
            <div style={styles.stepIndicator}>
              <StepDot active />
              <div style={styles.stepLine} />
              <StepDot active={false} />
              <div style={styles.stepLine} />
              <StepDot active={false} />
            </div>

            <h2 id="hearth-modal-title" style={{ ...t.sectionHeader, color: t.text, marginBottom: "4px" }}>
              Also add to Hearth?
            </h2>
            <p style={{ ...t.body, color: t.textSecondary, marginBottom: "16px" }}>
              Give <strong>{client.name}</strong> access to their own client portal.
            </p>

            <div style={styles.infoBox}>
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

            <div style={{ marginBottom: "16px" }}>
              <p style={{ ...t.caption, ...t.label, color: t.textSecondary, marginBottom: "8px" }}>
                Your client will get:
              </p>
              <ul style={styles.featureList}>
                <li>Transaction progress & milestones</li>
                <li>Direct messaging with you</li>
                <li>{isBuyer ? "Property tracking & finance calculator" : "Listing details & offer tracker"}</li>
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
              <div style={styles.warningBox} role="alert" aria-live="polite">
                <p style={{ ...t.caption, color: t.rust }}>{error}</p>
                {alreadyExists && (
                  <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                    <button
                      onClick={handleRetrySetup}
                      disabled={loading}
                      style={{
                        ...btnPrimary,
                        fontSize: "12px",
                        padding: "6px 14px",
                        opacity: loading ? 0.6 : 1,
                      }}
                    >
                      {loading ? "Retrying..." : "Retry Setup"}
                    </button>
                    {!resent && (
                      <button
                        onClick={handleResend}
                        disabled={resending}
                        style={{
                          ...btnSecondary,
                          fontSize: "12px",
                          padding: "6px 14px",
                          opacity: resending ? 0.6 : 1,
                        }}
                      >
                        {resending ? "Sending..." : "Resend Invite Email"}
                      </button>
                    )}
                    {resent && (
                      <p style={{ ...t.caption, color: t.teal, fontWeight: 600, alignSelf: "center" }}>
                        Invite resent
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div style={styles.actions}>
              <button onClick={onClose} style={btnSecondary}>
                Not now
              </button>
              <button
                onClick={() => setStep("permissions")}
                disabled={needsEmail}
                style={{
                  ...btnPrimary,
                  opacity: needsEmail ? 0.6 : 1,
                  cursor: needsEmail ? "not-allowed" : "pointer",
                }}
              >
                Next: Set Permissions
              </button>
            </div>
          </>
        ) : step === "permissions" ? (
          <>
            <div style={styles.stepIndicator}>
              <StepDot active />
              <div style={styles.stepLine} />
              <StepDot active />
              <div style={styles.stepLine} />
              <StepDot active={false} />
            </div>

            <h2 style={{ ...t.sectionHeader, color: t.text, marginBottom: "4px" }}>
              Set Portal Permissions
            </h2>
            <p style={{ ...t.body, color: t.textSecondary, marginBottom: "16px" }}>
              Control what <strong>{client.name}</strong> can see. You can change these later.
            </p>

            <div style={{ display: "grid", gap: "6px", marginBottom: "16px" }}>
              {permissionKeys.map((key) => {
                const info = PERMISSION_LABELS[key];
                const enabled = permissions[key];
                return (
                  <button
                    key={key}
                    onClick={() => togglePermission(key)}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "10px 12px", borderRadius: "8px",
                      background: enabled ? t.tealLight : t.bg,
                      border: `1px solid ${enabled ? "rgba(79, 108, 75, 0.2)" : t.border}`,
                      cursor: "pointer", textAlign: "left" as const,
                      fontFamily: t.font, transition: "all 0.12s",
                    }}
                  >
                    <div style={{
                      width: "32px", height: "18px", borderRadius: "9px",
                      background: enabled ? t.teal : t.textTertiary,
                      position: "relative" as const, flexShrink: 0,
                      transition: "background 0.12s",
                    }}>
                      <div style={{
                        width: "14px", height: "14px", borderRadius: "50%",
                        background: "#fff", position: "absolute" as const,
                        top: "2px", left: enabled ? "16px" : "2px",
                        transition: "left 0.12s",
                      }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ ...t.body, color: t.text, fontWeight: 500, display: "block" }}>
                        {info.label}
                      </span>
                      <span style={{ ...t.caption, color: t.textTertiary }}>
                        {info.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPermissions(getDefaultPermissions(isBuyer ? "buyer" : "seller"))}
              style={{
                ...btnSecondary, fontSize: "12px", padding: "6px 12px",
                marginBottom: "16px",
              }}
            >
              Reset to {isBuyer ? "Buyer" : "Seller"} Defaults
            </button>

            <div style={styles.actions}>
              <button onClick={() => setStep("confirm")} style={btnSecondary}>
                Back
              </button>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => {
                    setPermissions(getDefaultPermissions(isBuyer ? "buyer" : "seller"));
                    handleAdd();
                  }}
                  style={{
                    ...btnSecondary,
                    fontSize: "13px",
                  }}
                >
                  Skip & Use Defaults
                </button>
                <button onClick={() => setStep("review")} style={btnPrimary}>
                  Next: Review
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={styles.stepIndicator}>
              <StepDot active />
              <div style={styles.stepLine} />
              <StepDot active />
              <div style={styles.stepLine} />
              <StepDot active />
            </div>

            <h2 style={{ ...t.sectionHeader, color: t.text, marginBottom: "4px" }}>
              Review & Send
            </h2>
            <p style={{ ...t.body, color: t.textSecondary, marginBottom: "16px" }}>
              Confirm the details for <strong>{client.name}</strong>&apos;s invite.
            </p>

            <div style={{ ...styles.infoBox, background: t.bg, border: `1px solid ${t.border}`, textAlign: "left" as const }}>
              <div style={{ marginBottom: "12px" }}>
                <span style={{ ...t.label, color: t.textSecondary }}>Client</span>
                <p style={{ ...t.body, color: t.text, fontWeight: 500 }}>{client.name}</p>
              </div>
              <div style={{ marginBottom: "12px" }}>
                <span style={{ ...t.label, color: t.textSecondary }}>Email</span>
                <p style={{ ...t.body, color: t.teal }}>{client.email}</p>
              </div>
              <div style={{ marginBottom: "12px" }}>
                <span style={{ ...t.label, color: t.textSecondary }}>Type</span>
                <p style={{ ...t.body, color: t.text }}>{isBuyer ? "Buyer" : "Seller"}</p>
              </div>
              <div>
                <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>
                  Permissions
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {permissionKeys.map((key) => (
                    <span key={key} style={{
                      padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 500,
                      background: permissions[key] ? t.tealLight : t.rustLight,
                      color: permissions[key] ? t.teal : t.rust,
                    }}>
                      {permissions[key] ? "+" : "-"} {PERMISSION_LABELS[key].label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div style={styles.warningBox} role="alert" aria-live="polite">
                <p style={{ ...t.caption, color: t.rust }}>{error}</p>
              </div>
            )}

            <div style={styles.actions}>
              <button onClick={() => setStep("permissions")} style={btnSecondary}>
                Back
              </button>
              <button
                onClick={handleAdd}
                disabled={loading}
                style={{
                  ...btnPrimary,
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Sending invite..." : "Send Invite"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StepDot({ active }: { active: boolean }) {
  return (
    <div style={{
      width: "10px", height: "10px", borderRadius: "50%",
      background: active ? t.teal : t.border,
      transition: "background 0.15s",
    }} />
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
    maxWidth: "480px",
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto" as const,
  },
  stepIndicator: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0px",
    marginBottom: "20px",
  },
  stepLine: {
    width: "40px",
    height: "2px",
    background: t.border,
  },
  infoBox: {
    background: t.tealLight,
    border: `1px solid rgba(79, 108, 75, 0.12)`,
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
    border: `1px solid rgba(174, 64, 37, 0.15)`,
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
    justifyContent: "space-between",
    gap: "8px",
  },
};
