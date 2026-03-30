import { LiveTimer } from "@/components/timer/LiveTimer";
import { ManualEntry } from "@/components/timer/ManualEntry";

export function TimerPage() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", alignItems: "start" }}>
      <LiveTimer />
      <ManualEntry />
    </div>
  );
}
