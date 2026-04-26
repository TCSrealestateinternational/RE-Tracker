import type { Client, SharedTransaction } from "@/types";

export type HearthAccessStatus = "no-access" | "invite-pending" | "active-sync" | "sync-paused";

export function getAccessStatus(
  client: Client,
  transaction?: SharedTransaction,
): HearthAccessStatus {
  if (!client.hearthUserId) return "no-access";
  if (!transaction || !transaction.hearthPortalActive) return "invite-pending";
  if (transaction.syncPausedAt) return "sync-paused";
  // Show "Invite Pending" until the client has actually logged in
  if (!transaction.clientFirstLoginAt) return "invite-pending";
  return "active-sync";
}

export const ACCESS_STATUS_CONFIG: Record<
  HearthAccessStatus,
  { label: string; color: string; bgColor: string; iconName: string }
> = {
  "no-access": {
    label: "No Access",
    color: "#9ca3af",
    bgColor: "rgba(156, 163, 175, 0.10)",
    iconName: "block",
  },
  "invite-pending": {
    label: "Invite Pending",
    color: "#d97706",
    bgColor: "rgba(217, 119, 6, 0.10)",
    iconName: "schedule",
  },
  "active-sync": {
    label: "Active",
    color: "#16a34a",
    bgColor: "rgba(22, 163, 74, 0.10)",
    iconName: "sync",
  },
  "sync-paused": {
    label: "Paused",
    color: "#dc2626",
    bgColor: "rgba(220, 38, 38, 0.10)",
    iconName: "pause_circle",
  },
};
