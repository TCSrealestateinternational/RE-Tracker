// ── Activity Categories ──
export const ACTIVITY_CATEGORIES = [
  "Lead Gen",
  "Client Calls",
  "Showings",
  "Admin",
  "Marketing",
  "Education",
  "Transaction Coordination",
  "Home Search",
] as const;

export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];

// ── Lead Sources ──
export const LEAD_SOURCES = [
  "Sphere of Influence",
  "Referral",
  "Open House",
  "Online Lead",
  "Social Media",
  "Cold Call",
  "Door Knock",
  "Sign Call",
  "Expired/FSBO",
  "Paid Ads",
  "Other",
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

// ── Client ──
export type ClientStatus = "buyer" | "seller" | "both";

export type ClientStage =
  | "prospect"
  | "active"
  | "under-contract"
  | "closed"
  | "archived";

export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  status: ClientStatus;
  priceRange: { min: number; max: number };
  searchCriteria: string;
  stage: ClientStage;
  notes: string;
  commissionEarned: number;
  leadSource: LeadSource | "";
  followUpDate: string | null; // ISO date string YYYY-MM-DD
  createdAt: number;
  updatedAt: number;
}

// ── Time Entry ──
export interface TimeEntry {
  id: string;
  userId: string;
  category: ActivityCategory;
  clientId: string | null;
  leadSource: LeadSource | "";
  note: string;
  startTime: number;
  endTime: number | null;
  durationMs: number;
  manual: boolean;
  createdAt: number;
}

// ── Weekly Goals ──
export interface WeeklyGoal {
  userId: string;
  category: ActivityCategory;
  targetHours: number;
}

// ── Deal Pipeline ──
export const DEAL_STAGES = [
  "New Lead",
  "Active",
  "Under Contract",
  "Closed",
  "Lost",
] as const;

export type DealStage = (typeof DEAL_STAGES)[number];

export interface Deal {
  id: string;
  userId: string;
  clientId: string;
  clientName: string;
  stage: DealStage;
  projectedCommission: number;
  expectedCloseDate: string; // YYYY-MM-DD
  leadSource: LeadSource | "";
  notes: string;
  createdAt: number;
  updatedAt: number;
}

// ── Transaction Checklist ──
export const CHECKLIST_ITEMS = [
  "Inspection Scheduled",
  "Inspection Complete",
  "Appraisal Ordered",
  "Appraisal Complete",
  "Financing Contingency Cleared",
  "Title Search Complete",
  "Walk-Through Complete",
  "Closing Scheduled",
  "Closed",
] as const;

export type ChecklistItemKey = (typeof CHECKLIST_ITEMS)[number];

export interface TransactionChecklist {
  id: string;
  userId: string;
  clientId: string;
  dealId: string;
  items: Record<ChecklistItemKey, boolean>;
  createdAt: number;
  updatedAt: number;
}

// ── Daily Check-In ──
export interface DailyCheckIn {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  prospected: boolean;
  contactsMade: number;
  createdAt: number;
}

// ── Income Goal ──
export interface IncomeGoal {
  id: string;
  userId: string;
  annualTarget: number;
  avgCommissionPerDeal: number;
  createdAt: number;
  updatedAt: number;
}
