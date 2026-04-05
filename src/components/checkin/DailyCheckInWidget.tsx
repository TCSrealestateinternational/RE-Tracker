import { useState } from "react";
import { Flame, Check } from "lucide-react";
import { t, card, inputBase, btnPrimary, btnSecondary } from "@/styles/theme";
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
      <div data-tour="daily-checkin" style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <Check size={16} color={t.success} strokeWidth={2} />
          <h3 style={{ ...t.sectionHeader, color: t.text }}>Today's Check-In</h3>
        </div>
        <div style={{ display: "flex", gap: "24px" }}>
          <div>
            <div style={{ ...t.stat, fontSize: "20px", color: todayCheckIn.prospected ? t.success : t.textTertiary }}>
              {todayCheckIn.prospected ? "Yes" : "No"}
            </div>
            <div style={{ ...t.label, color: t.textTertiary, marginTop: "2px" }}>Prospected</div>
          </div>
          <div>
            <div style={{ ...t.stat, fontSize: "20px", color: t.teal }}>{todayCheckIn.contactsMade}</div>
            <div style={{ ...t.label, color: t.textTertiary, marginTop: "2px" }}>Contacts</div>
          </div>
          {streak > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Flame size={16} color={t.gold} strokeWidth={1.5} />
              <div>
                <div style={{ ...t.stat, fontSize: "20px", color: t.gold }}>{streak}</div>
                <div style={{ ...t.label, color: t.textTertiary, marginTop: "2px" }}>Day Streak</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div data-tour="daily-checkin" style={{ ...card, background: t.bg, border: `1px solid ${t.borderMedium}` }}>
      <h3 style={{ ...t.sectionHeader, color: t.text, marginBottom: "4px" }}>
        Morning Check-In
      </h3>
      <p style={{ ...t.body, color: t.textTertiary, marginBottom: "20px" }}>
        Did you prospect today? Track your contacts to build consistency.
      </p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", marginBottom: "16px" }}>
        <label style={{ width: "140px" }}>
          <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>
            Contacts made
          </span>
          <input
            type="number"
            min={0}
            value={contacts}
            onChange={(e) => setContacts(+e.target.value)}
            style={inputBase}
          />
        </label>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={() => onSubmit(true, contacts)} style={btnPrimary}>
          Yes, I prospected
        </button>
        <button onClick={() => onSubmit(false, 0)} style={btnSecondary}>
          Not today
        </button>
      </div>
      {streak > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "14px" }}>
          <Flame size={14} color={t.gold} strokeWidth={1.5} />
          <span style={{ ...t.caption, color: t.textTertiary }}>
            {streak} day streak — keep it going
          </span>
        </div>
      )}
    </div>
  );
}
