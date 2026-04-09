import type { Client } from "@/types";

/**
 * Default follow-up reminder date for an archived client.
 * Uses the deal's actualCloseDate when present, otherwise the archivedAt
 * timestamp, otherwise today. Always returns one year out as YYYY-MM-DD.
 */
export function defaultReminderDate(client: Client): string {
  let base: Date;
  if (client.archivedAt) {
    base = new Date(client.archivedAt);
  } else {
    base = new Date();
  }
  const next = new Date(base.getFullYear() + 1, base.getMonth(), base.getDate());
  return next.toISOString().slice(0, 10);
}

/**
 * True when a client has an unhandled reminder whose date is on or before
 * the supplied `today` string (YYYY-MM-DD).
 */
export function isReminderDue(client: Client, today: string): boolean {
  if (client.stage !== "archived") return false;
  if (!client.oneYearReminderDate) return false;
  if (client.oneYearReminderHandledAt) return false;
  return client.oneYearReminderDate <= today;
}
