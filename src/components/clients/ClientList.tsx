import { useState, useCallback } from "react";
import { Icon } from "@/components/shared/Icon";
import { deleteField } from "firebase/firestore";
import { t, card, btnPrimary, btnSecondary, inputBase } from "@/styles/theme";
import { todayStr } from "@/utils/dates";
import { exportClientPDF } from "@/utils/export";
import { useLongPress } from "@/hooks/useLongPress";
import { defaultReminderDate } from "@/utils/reminders";
import { ContextMenu } from "./ContextMenu";
import type { ContextMenuAction } from "./ContextMenu";
import type { Client, ClientStage } from "@/types";

interface ClientListProps {
  clients: Client[];
  onSelect: (client: Client) => void;
  onClientView?: (client: Client) => void;
  onAdd: () => void;
  onDeleteClients?: (ids: string[]) => Promise<void>;
  onBulkUpdateStage?: (ids: string[], stage: ClientStage) => Promise<void>;
  onArchiveClient?: (client: Client) => void;
  onUpdateClient?: (id: string, patch: Partial<Client>) => Promise<void>;
}

function getProjectedCommission(c: Client): number {
  if (!c.commissionMode) return 0;
  if (c.commissionMode === "flat") return c.commissionFlat ?? 0;
  const pct = c.commissionPercent ?? 0;
  const base = c.status === "buyer" ? (c.priceRange?.max ?? 0) : (c.listPrice ?? 0);
  return base * (pct / 100);
}

function fmtDollars(n: number): string {
  if (n === 0) return "";
  return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

type FolderKey = "closed" | "archived";

export function ClientList({ clients, onSelect, onClientView, onAdd, onDeleteClients, onBulkUpdateStage, onArchiveClient, onUpdateClient }: ClientListProps) {
  const today = todayStr();

  // Separate active vs folder clients
  const activeClients = clients.filter((c) => c.stage !== "closed" && c.stage !== "archived");
  const closedClients = clients.filter((c) => c.stage === "closed");
  const archivedClients = clients.filter((c) => c.stage === "archived");

  // Folder open state
  const [openFolders, setOpenFolders] = useState<Record<FolderKey, boolean>>({ closed: false, archived: false });
  function toggleFolder(key: FolderKey) {
    setOpenFolders((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function selectAll(list: Client[]) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      list.forEach((c) => next.add(c.id));
      return next;
    });
  }
  function deselectAll() {
    setSelectedIds(new Set());
  }

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleBulkDelete() {
    if (deleteConfirmText !== "DELETE" || !onDeleteClients) return;
    setDeleting(true);
    await onDeleteClients(Array.from(selectedIds));
    setDeleting(false);
    setShowDeleteModal(false);
    setDeleteConfirmText("");
    setSelectedIds(new Set());
    setBulkMode(false);
  }

  // Bulk status change
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  async function handleBulkStatusChange(stage: ClientStage) {
    if (!onBulkUpdateStage) return;
    await onBulkUpdateStage(Array.from(selectedIds), stage);
    setShowStatusMenu(false);
    setSelectedIds(new Set());
    setBulkMode(false);
  }

  const selectedCount = selectedIds.size;

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ clientId: string; x: number; y: number } | null>(null);

  // Single-client delete modal (from context menu)
  const [singleDeleteClient, setSingleDeleteClient] = useState<Client | null>(null);
  const [singleDeleteText, setSingleDeleteText] = useState("");
  const [singleDeleting, setSingleDeleting] = useState(false);

  async function handleSingleDelete() {
    if (singleDeleteText !== "DELETE" || !onDeleteClients || !singleDeleteClient) return;
    setSingleDeleting(true);
    await onDeleteClients([singleDeleteClient.id]);
    setSingleDeleting(false);
    setSingleDeleteClient(null);
    setSingleDeleteText("");
  }

  function openContextMenu(clientId: string, coords: { x: number; y: number }) {
    setContextMenu({ clientId, ...coords });
  }

  function getContextActions(clientId: string): ContextMenuAction[] {
    const client = clients.find((c) => c.id === clientId);
    const actions: ContextMenuAction[] = [];
    if (onArchiveClient && client && client.stage !== "archived") {
      actions.push({
        label: "Archive",
        iconName: "archive",
        onClick: () => onArchiveClient(client),
      });
    }
    if (onDeleteClients) {
      actions.push({
        label: "Delete",
        iconName: "delete",
        color: t.rust,
        onClick: () => {
          const c = clients.find((cl) => cl.id === clientId);
          if (c) setSingleDeleteClient(c);
        },
      });
    }
    return actions;
  }

  // Folder renderer
  const renderFolder = (key: FolderKey, label: string, items: Client[], color: string) => {
    if (items.length === 0) return null;
    const isOpen = openFolders[key];
    const isArchived = key === "archived";
    return (
      <div style={{ marginBottom: "8px" }}>
        <button
          onClick={() => toggleFolder(key)}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "none", border: "none", cursor: "pointer",
            padding: "10px 4px", width: "100%", fontFamily: t.font,
          }}
        >
          <Icon name={isOpen ? "expand_more" : "chevron_right"} size={16} color={t.textTertiary} />
          <span style={{ ...t.label, color }}>{label}</span>
          <span style={{
            padding: "1px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 600,
            background: t.bg, color: t.textTertiary,
          }}>
            {items.length}
          </span>
        </button>
        {isOpen && (
          <div style={{ display: "grid", gap: "8px", paddingLeft: "8px" }}>
            {items.map((c) => (
              isArchived ? (
                <ArchivedRow
                  key={c.id}
                  client={c}
                  today={today}
                  bulkMode={bulkMode}
                  isSelected={selectedIds.has(c.id)}
                  onSelect={onSelect}
                  onClientView={onClientView}
                  onToggleSelect={toggleSelect}
                  onLongPress={openContextMenu}
                  onUpdateClient={onUpdateClient}
                />
              ) : (
                <ClientRow
                  key={c.id}
                  client={c}
                  today={today}
                  showCheckbox
                  bulkMode={bulkMode}
                  isSelected={selectedIds.has(c.id)}
                  onSelect={onSelect}
                  onClientView={onClientView}
                  onToggleSelect={toggleSelect}
                  onLongPress={openContextMenu}
                />
              )
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div>
        <span style={{ ...t.eyebrow, color: t.gold, display: "block", marginBottom: "8px" }}>
          PORTFOLIO MANAGEMENT
        </span>
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ ...t.pageTitle, color: t.text }}>Your Client Ledger</h2>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => { setBulkMode(!bulkMode); if (bulkMode) { setSelectedIds(new Set()); } }} style={{
              ...btnSecondary, display: "flex", alignItems: "center", gap: "6px",
              fontSize: "13px", padding: "8px 14px",
              ...(bulkMode ? { borderColor: t.teal, color: t.teal } : {}),
            }}>
              {bulkMode ? "Done" : "Select"}
            </button>
            <button data-tour="add-client" onClick={onAdd} style={{ ...btnPrimary, display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon name="person_add" size={16} />
              Add Client
            </button>
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {bulkMode && (
        <div className="bulk-toolbar" style={{
          ...card, padding: "10px 16px", marginBottom: "16px",
          display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
        }}>
          <span style={{ ...t.caption, color: t.textSecondary }}>
            {selectedCount} selected
          </span>
          <button onClick={() => selectAll(clients)} style={{
            ...btnSecondary, padding: "4px 10px", fontSize: "12px",
          }}>
            Select All
          </button>
          {selectedCount > 0 && (
            <button onClick={deselectAll} style={{
              ...btnSecondary, padding: "4px 10px", fontSize: "12px",
            }}>
              Deselect All
            </button>
          )}
          {selectedCount > 0 && (
            <>
              <div style={{ position: "relative" }}>
                <button onClick={() => setShowStatusMenu(!showStatusMenu)} style={{
                  ...btnSecondary, padding: "4px 10px", fontSize: "12px",
                  display: "flex", alignItems: "center", gap: "4px",
                }}>
                  <Icon name="sync" size={12} />
                  Change Stage
                </button>
                {showStatusMenu && (
                  <div style={{
                    position: "absolute", top: "100%", left: 0, marginTop: "4px",
                    background: t.surface, border: `1px solid ${t.border}`, borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10,
                    overflow: "hidden", minWidth: "190px",
                  }}>
                    {(["prospect", "active", "under-contract", "closed", "archived"] as ClientStage[]).map((stage) => (
                      <button key={stage} onClick={() => handleBulkStatusChange(stage)} style={{
                        display: "block", width: "100%", textAlign: "left",
                        padding: "8px 14px", background: "none", border: "none",
                        cursor: "pointer", fontSize: "13px", fontFamily: t.font,
                        color: t.text,
                      }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = t.bg; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                      >
                        {stage}
                      </button>
                    ))}
                    <div style={{
                      borderTop: `1px solid ${t.border}`,
                      padding: "6px 14px",
                      ...t.caption,
                      color: t.textTertiary,
                      lineHeight: "1.35",
                    }}>
                      Bulk archive skips Hearth prompt
                    </div>
                  </div>
                )}
              </div>
              {onDeleteClients && (
                <button onClick={() => setShowDeleteModal(true)} style={{
                  ...btnSecondary, padding: "4px 10px", fontSize: "12px",
                  color: t.rust, borderColor: t.rust,
                  display: "flex", alignItems: "center", gap: "4px",
                }}>
                  <Icon name="delete" size={12} />
                  Delete ({selectedCount})
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Closed / Archived folders */}
      {renderFolder("closed", "Closed", closedClients, t.success)}
      {renderFolder("archived", "Archived", archivedClients, t.textTertiary)}

      {/* Active clients */}
      <div data-tour="client-list" style={{ display: "grid", gap: "8px" }}>
        {activeClients.map((c) => (
          <ClientRow
            key={c.id}
            client={c}
            today={today}
            showCheckbox
            bulkMode={bulkMode}
            isSelected={selectedIds.has(c.id)}
            onSelect={onSelect}
            onClientView={onClientView}
            onToggleSelect={toggleSelect}
            onLongPress={openContextMenu}
          />
        ))}
        {clients.length === 0 && (
          <div style={{ ...card, textAlign: "center", padding: "48px 24px" }}>
            <p style={{ ...t.body, color: t.textTertiary, marginBottom: "4px" }}>
              No clients yet.
            </p>
            <p style={{ ...t.caption, color: t.textTertiary }}>
              Add your first client to start tracking your time and commissions.
            </p>
          </div>
        )}
      </div>

      {/* Context menu (from long-press) */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          actions={getContextActions(contextMenu.clientId)}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Single-client delete modal (from context menu) */}
      {singleDeleteClient && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.4)",
        }}
          onClick={() => { setSingleDeleteClient(null); setSingleDeleteText(""); }}
          onKeyDown={(e) => { if (e.key === "Escape") { setSingleDeleteClient(null); setSingleDeleteText(""); } }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="single-delete-title"
            style={{
              ...card, maxWidth: "420px", width: "90%",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="single-delete-title" style={{ ...t.sectionHeader, color: t.rust, marginBottom: "12px" }}>
              Delete {singleDeleteClient.name}?
            </h3>
            <p style={{ ...t.body, color: t.textSecondary, marginBottom: "12px" }}>
              This will <strong>permanently remove</strong> all data for this client — time entries, commission records, checklist progress, and notes. This cannot be undone.
            </p>
            <div style={{
              background: t.goldLight, border: `1px solid rgba(110,99,83,0.2)`,
              borderRadius: "8px", padding: "10px 14px", marginBottom: "16px",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <Icon name="download" size={14} color={t.gold} />
              <span style={{ ...t.caption, color: t.gold }}>
                <button
                  onClick={() => exportClientPDF(singleDeleteClient)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: t.gold, fontWeight: 700, textDecoration: "underline",
                    fontFamily: t.font, fontSize: "inherit", padding: 0,
                  }}
                >
                  Download a PDF
                </button>
                {" "}of this client&apos;s data before deleting.
              </span>
            </div>
            <p style={{ ...t.caption, color: t.textSecondary, marginBottom: "8px" }}>
              Type <strong>DELETE</strong> to confirm:
            </p>
            <input
              value={singleDeleteText}
              onChange={(e) => setSingleDeleteText(e.target.value)}
              placeholder="DELETE"
              style={{ ...inputBase, marginBottom: "16px" }}
              autoFocus
            />
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button onClick={() => { setSingleDeleteClient(null); setSingleDeleteText(""); }} style={btnSecondary}>
                Cancel
              </button>
              <button
                onClick={handleSingleDelete}
                disabled={singleDeleteText !== "DELETE" || singleDeleting}
                style={{
                  ...btnPrimary,
                  background: singleDeleteText === "DELETE" ? t.rust : t.textTertiary,
                  opacity: singleDeleteText !== "DELETE" || singleDeleting ? 0.5 : 1,
                }}
              >
                {singleDeleting ? "Deleting…" : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk delete confirmation modal */}
      {showDeleteModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.4)",
        }}
          onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}
          onKeyDown={(e) => { if (e.key === "Escape") { setShowDeleteModal(false); setDeleteConfirmText(""); } }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="bulk-delete-title"
            style={{
              ...card, maxWidth: "400px", width: "90%",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="bulk-delete-title" style={{ ...t.sectionHeader, color: t.rust, marginBottom: "12px" }}>
              Delete {selectedCount} Client{selectedCount > 1 ? "s" : ""}?
            </h3>
            <p style={{ ...t.body, color: t.textSecondary, marginBottom: "16px" }}>
              This action cannot be undone. All data for the selected client{selectedCount > 1 ? "s" : ""} will be permanently removed.
            </p>
            <p style={{ ...t.caption, color: t.textSecondary, marginBottom: "8px" }}>
              Type <strong>DELETE</strong> to confirm:
            </p>
            <input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              style={{ ...inputBase, marginBottom: "16px" }}
              autoFocus
            />
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }} style={btnSecondary}>
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={deleteConfirmText !== "DELETE" || deleting}
                style={{
                  ...btnPrimary,
                  background: deleteConfirmText === "DELETE" ? t.rust : t.textTertiary,
                  opacity: deleteConfirmText !== "DELETE" || deleting ? 0.5 : 1,
                }}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ClientRow (extracted for hook support) ──
interface ClientRowProps {
  client: Client;
  today: string;
  showCheckbox: boolean;
  bulkMode: boolean;
  isSelected: boolean;
  onSelect: (c: Client) => void;
  onClientView?: (c: Client) => void;
  onToggleSelect: (id: string) => void;
  onLongPress: (clientId: string, coords: { x: number; y: number }) => void;
}

function ClientRow({ client: c, today, showCheckbox, bulkMode, isSelected, onSelect, onClientView, onToggleSelect, onLongPress }: ClientRowProps) {
  const followUpDue = c.followUpDate != null && c.followUpDate <= today;
  const projected = getProjectedCommission(c);

  const longPressHandlers = useLongPress(
    useCallback((coords: { x: number; y: number }) => onLongPress(c.id, coords), [c.id, onLongPress]),
  );

  return (
    <div
      style={{
        ...card,
        display: "flex", alignItems: "center", gap: "12px",
        padding: "16px 20px", marginBottom: "0",
        cursor: "pointer",
        transition: "background 0.12s",
        fontFamily: t.font,
        background: isSelected && bulkMode ? t.tealLight : t.surface,
        userSelect: "none", WebkitUserSelect: "none",
      }}
      onMouseEnter={(e) => { if (!isSelected || !bulkMode) e.currentTarget.style.background = t.surfaceHover; }}
      onMouseDown={longPressHandlers.onMouseDown}
      onMouseUp={longPressHandlers.onMouseUp}
      onMouseLeave={(e) => { longPressHandlers.onMouseLeave(); e.currentTarget.style.background = isSelected && bulkMode ? t.tealLight : t.surface; }}
      onTouchStart={longPressHandlers.onTouchStart}
      onTouchEnd={longPressHandlers.onTouchEnd}
      onTouchMove={longPressHandlers.onTouchMove}
      onContextMenu={longPressHandlers.onContextMenu}
    >
      {showCheckbox && bulkMode && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => { e.stopPropagation(); onToggleSelect(c.id); }}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select ${c.name}`}
          style={{ accentColor: t.teal, width: "16px", height: "16px", cursor: "pointer", flexShrink: 0 }}
        />
      )}
      <button
        onClick={() => !bulkMode ? onSelect(c) : onToggleSelect(c.id)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          width: "100%", textAlign: "left", padding: 0, fontFamily: t.font,
          minWidth: 0, overflow: "hidden",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              padding: "2px 8px", borderRadius: "4px",
              fontSize: "11px", fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase",
              background: c.status === "buyer" ? "rgba(79, 108, 75, 0.10)" : "rgba(110, 99, 83, 0.12)",
              color: c.status === "buyer" ? t.teal : t.gold,
              flexShrink: 0,
            }}>
              {c.status === "buyer" ? <Icon name="home" size={11} /> : <Icon name="description" size={11} />}
              {c.status === "buyer" ? "Buyer" : "Seller"}
            </span>
            <span style={{ fontWeight: 600, fontSize: "14px", color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {c.name}
            </span>
            {followUpDue && (
              <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <Icon name="error" size={12} color={t.rust} />
                <span style={{ ...t.caption, color: t.rust, fontWeight: 500 }}>Follow-up due</span>
              </span>
            )}
          </div>
          {c.additionalContacts?.length > 0 && (
            <div style={{ ...t.caption, color: t.textSecondary, marginTop: "3px", paddingLeft: "0px" }}>
              {c.additionalContacts.map((p, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginRight: "12px" }}>
                  <span style={{ fontWeight: 500, color: t.text }}>{p.name}</span>
                  {p.phone && (
                    <a href={`tel:${p.phone}`} onClick={(e) => e.stopPropagation()} style={{ color: t.teal, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                      <Icon name="call" size={10} />
                      {p.phone}
                    </a>
                  )}
                </span>
              ))}
            </div>
          )}
          <div style={{ ...t.caption, color: t.textTertiary, marginTop: "2px" }}>
            {c.stage}
            {c.leadSource && <> &middot; {c.leadSource}</>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
            {c.commissionEarned > 0 && (
              <span style={{ fontWeight: 600, fontSize: "14px", color: t.gold }}>
                {fmtDollars(c.commissionEarned)}
              </span>
            )}
            {projected > 0 && c.commissionEarned === 0 && (
              <span style={{ ...t.caption, color: t.textTertiary, fontStyle: "italic" }}>
                Proj: {fmtDollars(projected)}
              </span>
            )}
          </div>
        </div>
      </button>
      {onClientView && !bulkMode && (
        <button
          title="Client View"
          aria-label={`View ${c.name} client dashboard`}
          onClick={(e) => { e.stopPropagation(); onClientView(c); }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "32px", height: "32px", borderRadius: "6px", flexShrink: 0,
            background: "transparent", border: `1px solid ${t.border}`,
            cursor: "pointer", transition: "background 0.12s, border-color 0.12s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = t.tealLight; e.currentTarget.style.borderColor = t.teal; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = t.border; }}
        >
          <Icon name="visibility" size={14} color={t.teal} />
        </button>
      )}
    </div>
  );
}

// ── ArchivedRow ──
// Wraps ClientRow with a small reminder control strip.
interface ArchivedRowProps {
  client: Client;
  today: string;
  bulkMode: boolean;
  isSelected: boolean;
  onSelect: (c: Client) => void;
  onClientView?: (c: Client) => void;
  onToggleSelect: (id: string) => void;
  onLongPress: (clientId: string, coords: { x: number; y: number }) => void;
  onUpdateClient?: (id: string, patch: Partial<Client>) => Promise<void>;
}

function ArchivedRow({ client, today, bulkMode, isSelected, onSelect, onClientView, onToggleSelect, onLongPress, onUpdateClient }: ArchivedRowProps) {
  const hasReminder = Boolean(client.oneYearReminderDate);
  const handled = Boolean(client.oneYearReminderHandledAt);

  async function handleSetReminder() {
    if (!onUpdateClient) return;
    const date = defaultReminderDate(client);
    await onUpdateClient(client.id, { oneYearReminderDate: date });
  }

  async function handleClearReminder() {
    if (!onUpdateClient) return;
    // Use deleteField via a cast so the plan's intent (cleanup) is preserved.
    await onUpdateClient(client.id, {
      oneYearReminderDate: deleteField() as unknown as string,
      oneYearReminderHandledAt: deleteField() as unknown as number,
    });
  }

  return (
    <div style={{ display: "grid", gap: "4px" }}>
      <ClientRow
        client={client}
        today={today}
        showCheckbox
        bulkMode={bulkMode}
        isSelected={isSelected}
        onSelect={onSelect}
        onClientView={onClientView}
        onToggleSelect={onToggleSelect}
        onLongPress={onLongPress}
      />
      {onUpdateClient && (
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "4px 12px 4px 16px",
          flexWrap: "wrap",
        }}>
          {!hasReminder && (
            <button
              onClick={handleSetReminder}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "4px 10px", fontSize: "11px", fontFamily: t.font,
                background: "transparent", border: `1px dashed ${t.borderMedium}`,
                borderRadius: "6px", cursor: "pointer", color: t.textSecondary,
              }}
            >
              <Icon name="notifications" size={11} />
              Set 1-yr reminder
            </button>
          )}
          {hasReminder && !handled && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "4px 10px", fontSize: "11px", fontFamily: t.font,
              background: t.goldLight, color: t.gold,
              borderRadius: "6px",
            }}>
              <Icon name="notifications" size={11} />
              Reminder: {client.oneYearReminderDate}
              <button
                onClick={handleClearReminder}
                title="Clear reminder"
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: "none", border: "none", cursor: "pointer",
                  padding: 0, marginLeft: "2px", color: t.gold,
                }}
              >
                <Icon name="close" size={11} />
              </button>
            </span>
          )}
          {hasReminder && handled && client.oneYearReminderHandledAt && (
            <span style={{
              ...t.caption,
              color: t.textTertiary,
              fontStyle: "italic",
            }}>
              Reached out {new Date(client.oneYearReminderHandledAt).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
