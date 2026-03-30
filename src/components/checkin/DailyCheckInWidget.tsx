import { useState } from "react";
import { theme } from "@/styles/theme";
import type { DailyCheckIn } from "@/types";

interface DailyCheckInWidgetProps {
  todayCheckIn: DailyCheckIn | null;
  streak: number;
  onSubmit: (prospected: boolean, contactsMade: number) => void;
}

export function DailyCheckInWidget({ todayCheckIn, streak, onSubmit }: DailyCheckInWidgetProps) {
  const [contacts, setContacts] = useState(0);

  if (todayCheckIn) {
    return (
      <div style={{
        background: theme.colors.white, borderRadius: "12px", padding: "1.25rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}>
        <h3 style={{ fontSize: "0.95rem", color: theme.colors.teal, marginBottom: "0.5rem" }}>
          Daily Check-In
        </h3>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: todayCheckIn.prospected ? "#10b981" : theme.colors.rust }}>
              {todayCheckIn.prospected ? "Yes" : "No"}
            </div>
            <div style={{ fontSize: "0.75rem", color: theme.colors.gray500 }}>Prospected</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: theme.colors.teal }}>
              {todayCheckIn.contactsMade}
            </div>
            <div style={{ fontSize: "0.75rem", color: theme.colors.gray500 }}>Contacts</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: theme.colors.gold }}>
              {streak}
            </div>
            <div style={{ fontSize: "0.75rem", color: theme.colors.gray500 }}>Day Streak</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: `linear-gradient(135deg, ${theme.colors.teal}, #155e6e)`,
      borderRadius: "12px", padding: "1.25rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)", color: theme.colors.white,
    }}>
      <h3 style={{ fontSize: "0.95rem", marginBottom: "0.75rem" }}>
        Morning Check-In
      </h3>
      <p style={{ fontSize: "0.85rem", opacity: 0.9, marginBottom: "1rem" }}>
        Did you prospect today? How many contacts did you make?
      </p>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", marginBottom: "0.75rem" }}>
        <label style={{ flex: 1 }}>
          <span style={{ display: "block", fontSize: "0.75rem", opacity: 0.8, marginBottom: "0.25rem" }}>Contacts made</span>
          <input
            type="number"
            min={0}
            value={contacts}
            onChange={(e) => setContacts(+e.target.value)}
            style={{
              width: "100%", padding: "0.5rem", borderRadius: "6px", border: "none",
              fontSize: "0.85rem", boxSizing: "border-box",
            }}
          />
        </label>
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          onClick={() => onSubmit(true, contacts)}
          style={{
            flex: 1, padding: "0.625rem", background: "#10b981", color: "white",
            border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem",
          }}
        >
          Yes, I Prospected
        </button>
        <button
          onClick={() => onSubmit(false, 0)}
          style={{
            padding: "0.625rem 1rem", background: "rgba(255,255,255,0.2)", color: "white",
            border: "1px solid rgba(255,255,255,0.3)", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem",
          }}
        >
          Not Today
        </button>
      </div>
      {streak > 0 && (
        <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", opacity: 0.85 }}>
          Current streak: <strong>{streak} days</strong>
        </div>
      )}
    </div>
  );
}
