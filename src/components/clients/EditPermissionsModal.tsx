import { useState } from "react";
import { t, card, btnPrimary, btnSecondary } from "@/styles/theme";
import { Icon } from "@/components/shared/Icon";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useTransactionSync } from "@/hooks/useTransactionSync";
import { useAuth } from "@/context/AuthContext";
import { PERMISSION_LABELS, getDefaultPermissions } from "@/constants/permissionDefaults";
import { PermissionHistory } from "./PermissionHistory";
import { getAccessStatus, ACCESS_STATUS_CONFIG } from "@/utils/clientAccess";
import type { Client, SharedTransaction, SyncPermissions, SyncPermissionKey } from "@/types";
import type { CSSProperties } from "react";

interface EditPermissionsModalProps {
  client: Client;
  transaction: SharedTransaction;
  onClose: () => void;
}

export function EditPermissionsModal({ client, transaction, onClose }: EditPermissionsModalProps) {
  const { user } = useAuth();
  const { updateSyncPermissions, pauseSync, resumeSync } = useTransactionSync();
  const dialogRef = useFocusTrap<HTMLDivElement>({ onEscape: onClose });

  const isBuyer = client.status === "buyer";
  const defaults = getDefaultPermissions(isBuyer ? "buyer" : "seller");
  const currentPerms = transaction.syncPermissions || defaults;
  const [permissions, setPermissions] = useState<SyncPermissions>({ ...currentPerms });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const isPaused = Boolean(transaction.syncPausedAt);
  const status = getAccessStatus(client, transaction);
  const statusConfig = ACCESS_STATUS_CONFIG[status];

  const permissionKeys = Object.keys(PERMISSION_LABELS) as SyncPermissionKey[];

  function togglePermission(key: SyncPermissionKey) {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const hasChanges = permissionKeys.some((k) => permissions[k] !== currentPerms[k]);

  async function handleSave() {
    if (!user || !hasChanges) return;
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      const changes = permissionKeys
        .filter((k) => permissions[k] !== currentPerms[k])
        .map((k) => ({ field: k, oldValue: currentPerms[k], newValue: permissions[k] }));
      await updateSyncPermissions(transaction.id, permissions, user.uid, changes);
      setSuccessMsg("Permissions updated");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Failed to save permissions:", err);
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePause() {
    if (!user) return;
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      if (isPaused) {
        await resumeSync(transaction.id, user.uid);
        setSuccessMsg("Sync resumed");
      } else {
        await pauseSync(transaction.id, user.uid);
        setSuccessMsg("Sync paused");
      }
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Failed to toggle pause:", err);
      setError("Failed to update sync status.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="edit-perms-title" style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <h2 id="edit-perms-title" style={{ ...t.sectionHeader, color: t.text, marginBottom: "4px" }}>
              Hearth Permissions
            </h2>
            <p style={{ ...t.body, color: t.textSecondary }}>
              {client.name}
            </p>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "4px 10px", borderRadius: "6px",
            background: statusConfig.bgColor,
            color: statusConfig.color,
            fontSize: "12px", fontWeight: 600,
          }}>
            <Icon name={statusConfig.iconName} size={12} />
            {statusConfig.label}
          </div>
        </div>

        {/* Pause/Resume banner */}
        {isPaused && (
          <div style={{
            background: t.rustLight, border: `1px solid rgba(174, 64, 37, 0.15)`,
            borderRadius: "8px", padding: "10px 14px", marginBottom: "16px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon name="pause_circle" size={16} color={t.rust} />
              <span style={{ ...t.caption, color: t.rust, fontWeight: 600 }}>
                Sync is paused — client cannot see any updates
              </span>
            </div>
            <button onClick={handleTogglePause} disabled={saving} style={{
              ...btnSecondary, fontSize: "12px", padding: "4px 10px",
              borderColor: t.rust, color: t.rust,
            }}>
              Resume
            </button>
          </div>
        )}

        {/* Permission toggles */}
        <div style={{ display: "grid", gap: "4px", marginBottom: "12px" }}>
          {permissionKeys.map((key) => {
            const info = PERMISSION_LABELS[key];
            const enabled = permissions[key];
            const changed = enabled !== currentPerms[key];
            return (
              <button
                key={key}
                onClick={() => togglePermission(key)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "8px 10px", borderRadius: "8px",
                  background: changed ? (enabled ? "rgba(79, 108, 75, 0.08)" : "rgba(174, 64, 37, 0.06)") : "transparent",
                  border: `1px solid ${changed ? (enabled ? "rgba(79, 108, 75, 0.2)" : "rgba(174, 64, 37, 0.15)") : "transparent"}`,
                  cursor: "pointer", textAlign: "left" as const,
                  fontFamily: t.font, transition: "all 0.12s",
                }}
              >
                <div style={{
                  width: "28px", height: "16px", borderRadius: "8px",
                  background: enabled ? t.teal : t.textTertiary,
                  position: "relative" as const, flexShrink: 0,
                  transition: "background 0.12s",
                }}>
                  <div style={{
                    width: "12px", height: "12px", borderRadius: "50%",
                    background: "#fff", position: "absolute" as const,
                    top: "2px", left: enabled ? "14px" : "2px",
                    transition: "left 0.12s",
                  }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ ...t.body, color: t.text, fontWeight: 500, fontSize: "13px" }}>
                    {info.label}
                  </span>
                  {changed && (
                    <span style={{
                      ...t.caption, marginLeft: "6px",
                      color: enabled ? t.teal : t.rust,
                      fontWeight: 600,
                    }}>
                      (changed)
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action buttons */}
        {error && (
          <div style={{ ...t.caption, color: t.rust, marginBottom: "8px" }} role="alert">
            {error}
          </div>
        )}
        {successMsg && (
          <div style={{ ...t.caption, color: t.success, marginBottom: "8px", fontWeight: 600 }}>
            {successMsg}
          </div>
        )}

        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            style={{
              ...btnPrimary, flex: 1,
              opacity: !hasChanges || saving ? 0.5 : 1,
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {!isPaused && (
            <button onClick={handleTogglePause} disabled={saving} style={{
              ...btnSecondary, display: "flex", alignItems: "center", gap: "4px",
              color: t.rust, borderColor: t.rust,
            }}>
              <Icon name="pause" size={14} />
              Pause Sync
            </button>
          )}
        </div>

        {/* Permission History */}
        <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: "12px" }}>
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "none", border: "none", cursor: "pointer",
              fontFamily: t.font, ...t.label, color: t.textSecondary,
              padding: 0, marginBottom: showHistory ? "10px" : 0,
            }}
          >
            <Icon name={showHistory ? "expand_more" : "chevron_right"} size={14} />
            Permission History ({transaction.permissionHistory?.length || 0})
          </button>
          {showHistory && (
            <PermissionHistory entries={transaction.permissionHistory || []} />
          )}
        </div>

        <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={btnSecondary}>
            Close
          </button>
        </div>
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
    maxWidth: "500px",
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto" as const,
  },
};
