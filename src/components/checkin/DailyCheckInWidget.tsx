import { useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { t, card, inputBase, btnPrimary, btnSecondary } from "@/styles/theme";
import type { DailyCheckIn } from "@/types";

interface DailyCheckInWidgetProps {
  todayCheckIn: DailyCheckIn | null;
  streak: number;
  onSubmit: (prospected: boolean, contactsMade: number) => void;
  checkIns?: DailyCheckIn[];
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getWeekDates(): string[] {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const mondayOffset = day === 0 ? -6 : 1 - day;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + mondayOffset + i);
    return d.toISOString().slice(0, 10);
  });
}

function StreakDots({ checkIns }: { checkIns?: DailyCheckIn[] }) {
  const weekDates = getWeekDates();
  const todayStr = new Date().toISOString().slice(0, 10);
  const checkedDates = new Set(checkIns?.filter((c) => c.prospected).map((c) => c.date) ?? []);

  return (
    <div style={{ display: "flex", gap: "8px", marginBottom: "16px", justifyContent: "center" }}>
      {weekDates.map((date, i) => {
        const isToday = date === todayStr;
        const done = checkedDates.has(date);
        const isFuture = date > todayStr;
        return (
          <div key={date} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              background: done ? t.success : isFuture ? t.tealLight : "rgba(12, 65, 78, 0.08)",
              border: isToday ? `2px solid ${t.teal}` : "2px solid transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s",
            }}>
              {done && <Icon name="check" size={12} color="#fff" />}
            </div>
            <span style={{ fontSize: "10px", fontWeight: isToday ? 700 : 400, color: isToday ? t.teal : t.textTertiary }}>
              {DAY_LABELS[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function DailyCheckInWidget({ todayCheckIn, streak, onSubmit, checkIns }: DailyCheckInWidgetProps) {
  const [contacts, setContacts] = useState(0);

  if (todayCheckIn) {
    return (
      <div data-tour="daily-checkin" style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <Icon name="check_circle" size={18} color={t.success} />
          <h3 style={{ ...t.sectionHeader, color: t.text }}>Today's Check-In</h3>
        </div>
        <StreakDots checkIns={checkIns} />
        <div className="wrap-row" style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <div>
            <div style={{ ...t.stat, fontSize: "20px", color: todayCheckIn.prospected ? t.success : t.textTertiary }}>
              {todayCheckIn.prospected ? "Yes" : "No"}
            </div>
            <div style={{ ...t.microLabel, color: t.textTertiary, marginTop: "4px" }}>Prospected</div>
          </div>
          <div>
            <div style={{ ...t.stat, fontSize: "20px", color: t.teal }}>{todayCheckIn.contactsMade}</div>
            <div style={{ ...t.microLabel, color: t.textTertiary, marginTop: "4px" }}>Contacts</div>
          </div>
          {streak > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Icon name="local_fire_department" size={18} color={t.gold} />
              <div>
                <div style={{ ...t.stat, fontSize: "20px", color: t.gold }}>{streak}</div>
                <div style={{ ...t.microLabel, color: t.textTertiary, marginTop: "4px" }}>Day Streak</div>
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
      <p style={{ ...t.body, color: t.textTertiary, marginBottom: "16px" }}>
        Did you prospect today? Track your contacts to build consistency.
      </p>
      <StreakDots checkIns={checkIns} />
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
      <div className="touch-actions" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button onClick={() => onSubmit(true, contacts)} style={btnPrimary}>
          Yes, I prospected
        </button>
        <button onClick={() => onSubmit(false, 0)} style={btnSecondary}>
          Not today
        </button>
      </div>
      {streak > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "14px" }}>
          <Icon name="local_fire_department" size={16} color={t.gold} />
          <span style={{ ...t.caption, color: t.textTertiary }}>
            {streak} day streak — keep it going
          </span>
        </div>
      )}
    </div>
  );
}
