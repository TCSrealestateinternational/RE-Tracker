import { useState } from "react";
import { usePortalData } from "@/hooks/portal/usePortalData";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { t, card, inputBase, btnPrimary } from "@/styles/theme";
import { ClipboardList, MessageSquare, Calendar } from "lucide-react";

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function PortalDecisionsPage() {
  const { decisions, loading } = usePortalData();
  const { profile } = useAuth();
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  if (loading) {
    return <p style={{ ...t.body, color: t.textTertiary, padding: "40px", textAlign: "center" }}>Loading...</p>;
  }

  if (decisions.length === 0) {
    return (
      <div style={{ ...card, textAlign: "center", padding: "60px 40px" }}>
        <ClipboardList size={36} color={t.textTertiary} style={{ marginBottom: "12px" }} />
        <h2 style={{ ...t.sectionHeader, color: t.text, marginBottom: "12px" }}>No Decisions Yet</h2>
        <p style={{ ...t.body, color: t.textSecondary }}>
          As your transaction progresses, your agent will log key decisions here so you always have a record of what was decided and why.
        </p>
      </div>
    );
  }

  async function saveNote(decisionId: string) {
    await updateDoc(doc(db, "decisions", decisionId), {
      clientNote: noteText,
      updatedAt: Date.now(),
    });
    setEditingNote(null);
    setNoteText("");
  }

  return (
    <div>
      <h1 style={{ ...t.pageTitle, color: t.text, marginBottom: "8px" }}>
        Decision Log
      </h1>
      <p style={{ ...t.body, color: t.textSecondary, marginBottom: t.sectionGap }}>
        A record of key decisions made during your transaction.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {decisions.map((d) => (
          <div key={d.id} style={{ ...card }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <h3 style={{ ...t.sectionHeader, color: t.text, margin: 0 }}>{d.title}</h3>
              <span style={{
                ...t.caption,
                color: t.teal,
                background: t.tealLight,
                padding: "2px 10px",
                borderRadius: "12px",
                fontWeight: 500,
                flexShrink: 0,
              }}>
                {d.phase}
              </span>
            </div>

            <p style={{ ...t.body, color: t.textSecondary, marginBottom: "12px" }}>{d.description}</p>

            {d.outcome && (
              <div style={{
                background: t.successLight,
                padding: "10px 14px",
                borderRadius: "8px",
                marginBottom: "12px",
              }}>
                <span style={{ ...t.label, color: t.success, display: "block", marginBottom: "4px" }}>Outcome</span>
                <span style={{ ...t.body, color: t.text }}>{d.outcome}</span>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: d.clientNote || editingNote === d.id ? "12px" : 0 }}>
              <span style={{ ...t.caption, color: t.textTertiary, display: "flex", alignItems: "center", gap: "4px" }}>
                <Calendar size={12} /> {fmtDate(d.createdAt)}
              </span>
              {profile?.role === "client" && editingNote !== d.id && (
                <button
                  onClick={() => { setEditingNote(d.id); setNoteText(d.clientNote || ""); }}
                  style={{
                    ...t.caption,
                    color: t.teal,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontFamily: t.font,
                    padding: 0,
                  }}
                >
                  <MessageSquare size={12} /> {d.clientNote ? "Edit note" : "Add note"}
                </button>
              )}
            </div>

            {d.clientNote && editingNote !== d.id && (
              <div style={{
                background: t.goldLight,
                padding: "10px 14px",
                borderRadius: "8px",
              }}>
                <span style={{ ...t.label, color: t.gold, display: "block", marginBottom: "4px" }}>Your Note</span>
                <span style={{ ...t.body, color: t.text }}>{d.clientNote}</span>
              </div>
            )}

            {editingNote === d.id && (
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add your thoughts..."
                  style={{ ...inputBase, flex: 1 }}
                />
                <button onClick={() => saveNote(d.id)} style={{ ...btnPrimary, padding: "10px 16px" }}>Save</button>
                <button onClick={() => setEditingNote(null)} style={{
                  padding: "10px 16px",
                  background: "transparent",
                  border: `1px solid ${t.borderMedium}`,
                  borderRadius: "8px",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontFamily: t.font,
                  color: t.textSecondary,
                }}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
