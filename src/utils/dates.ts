export function getWeekStart(date?: Date): number {
  const d = date ? new Date(date) : new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d.getFullYear(), d.getMonth(), diff);
  mon.setHours(0, 0, 0, 0);
  return mon.getTime();
}

export function getMonthStart(date?: Date): number {
  const d = date ? new Date(date) : new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

export function getYearStart(date?: Date): number {
  const d = date ? new Date(date) : new Date();
  return new Date(d.getFullYear(), 0, 1).getTime();
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatHours(ms: number): string {
  if (ms <= 0) return "0s";
  const totalSec = Math.floor(ms / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const totalMin = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (totalMin < 60) return s > 0 ? `${totalMin}m ${s}s` : `${totalMin}m`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function getMonthLabel(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export function getWeekLabel(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
