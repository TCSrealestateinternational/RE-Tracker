import type { SyncPermissionKey, SyncPermissions } from "@/types";

export const BUYER_PERMISSION_DEFAULTS: SyncPermissions = {
  status: true,
  milestones: true,
  documents: true,
  property: true,
  messages: true,
  checklist: true,
  finance: true,
  offers: false,
};

export const SELLER_PERMISSION_DEFAULTS: SyncPermissions = {
  status: true,
  milestones: true,
  documents: true,
  property: true,
  messages: true,
  checklist: true,
  finance: false,
  offers: true,
};

export const PERMISSION_LABELS: Record<SyncPermissionKey, { label: string; description: string }> = {
  status: { label: "Transaction Status", description: "Current deal stage and status updates" },
  milestones: { label: "Milestones", description: "Progress milestones and timeline" },
  documents: { label: "Documents", description: "Shared documents and files" },
  property: { label: "Property Details", description: "Property info, photos, and comparisons" },
  messages: { label: "Messages", description: "Direct messaging with agent" },
  checklist: { label: "Checklist", description: "Transaction checklist progress" },
  finance: { label: "Finance", description: "Mortgage calculators and finance scenarios" },
  offers: { label: "Offers", description: "Offer details and status tracking" },
};

export function getDefaultPermissions(type: "buyer" | "seller"): SyncPermissions {
  return type === "buyer" ? { ...BUYER_PERMISSION_DEFAULTS } : { ...SELLER_PERMISSION_DEFAULTS };
}
