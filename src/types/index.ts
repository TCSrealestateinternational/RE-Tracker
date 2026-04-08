// ── Activity Categories ──
export const ACTIVITY_CATEGORIES = [
  "Lead Gen",
  "Client Calls/Texts",
  "Showings",
  "Writing an Offer",
  "Admin",
  "Marketing",
  "Home Searches",
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
export type ClientStatus = "buyer" | "seller";

export type ClientStage =
  | "prospect"
  | "active"
  | "under-contract"
  | "closed"
  | "archived";

export interface ContactPerson {
  name: string;
  email: string;
  phone: string;
}

export type OfferStatus = "accepted" | "countered" | "rejected";

export interface Offer {
  amount: number;
  status: OfferStatus;
}

export interface DriveLink {
  label: string;
  url: string;
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  additionalContacts: ContactPerson[];
  status: ClientStatus;
  stage: ClientStage;
  notes: string;
  leadSource: LeadSource | "";
  followUpDate: string | null; // ISO date string YYYY-MM-DD
  commissionEarned: number;
  driveLinks: DriveLink[];

  // Commission projection (both buyer & seller)
  commissionMode: "percentage" | "flat";
  commissionPercent: number;
  commissionFlat: number;

  // Buyer-specific
  lenderName: string;
  preApprovalAmount: number;
  priceRange: { min: number; max: number };
  searchCriteria: string;
  dateUnderContract: string | null;
  projectedCloseDate: string | null;

  // Seller-specific
  propertyAddress: string;
  listPrice: number;
  priceReductions: number[];
  offers: Offer[];
  acceptedOfferDate: string | null;
  expectedCloseDate: string | null;

  // Hearth portal link
  hearthUserId?: string;

  // Agent-editable client status (shown on client dashboard)
  statusMessage?: string;
  actionItems?: string[];

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
  purchasePrice: number;
  commissionPercent: number;
  projectedCommission: number;
  actualCommission: number | null;
  expectedCloseDate: string;
  actualCloseDate: string | null;
  leadSource: LeadSource | "";
  notes: string;
  transactionId?: string; // links to shared /transactions/{id}
  createdAt: number;
  updatedAt: number;
}

// ── Transaction Checklists ──
// Comprehensive stage-based templates live in constants/checklist-*.ts.
// Flat label arrays are derived here for backward compatibility.
import { BUYER_CHECKLIST_TEMPLATE } from "@/constants/checklist-buyer";
import { SELLER_CHECKLIST_TEMPLATE } from "@/constants/checklist-seller";

export const BUYER_CHECKLIST_ITEMS = BUYER_CHECKLIST_TEMPLATE.map((i) => i.label);
export const SELLER_CHECKLIST_ITEMS = SELLER_CHECKLIST_TEMPLATE.map((i) => i.label);

export interface TransactionChecklist {
  id: string;
  userId: string;
  clientId: string;
  type: "buyer" | "seller";
  items: Record<string, boolean>;
  notifications?: Record<string, boolean>; // per-item notify preferences
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

// ── Agent Referrals ──
export type ReferralStatus = "pending" | "under-contract" | "closed" | "paid" | "lost";

export interface Referral {
  id: string;
  userId: string;
  agentName: string;
  agentEmail: string;
  agentPhone: string;
  clientName: string;
  referralDate: string;
  expectedCommission: number;
  referralPercent: number;
  referralFee: number;
  status: ReferralStatus;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

// ── Subscription System ──
export type SubscriptionPlan = "hearth_only" | "tracker_only" | "full_platform" | "white_label";
export type SubscriptionStatus = "active" | "trialing" | "suspended" | "cancelled";

export interface SubscriptionFeatures {
  reTracker: boolean;
  hearthPortal: boolean;
  whiteLabel: boolean;
  maxClients: number;
}

export interface Subscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  features: SubscriptionFeatures;
  trialEndsAt: number | null;
  billingCycleEnd: number | null;
  whiteLabel?: {
    brokerageSlug: string;
    customDomain?: string;
  };
}

export const PLAN_DEFAULTS: Record<SubscriptionPlan, SubscriptionFeatures> = {
  hearth_only: { reTracker: false, hearthPortal: true, whiteLabel: false, maxClients: 25 },
  tracker_only: { reTracker: true, hearthPortal: false, whiteLabel: false, maxClients: 50 },
  full_platform: { reTracker: true, hearthPortal: true, whiteLabel: false, maxClients: 100 },
  white_label: { reTracker: true, hearthPortal: true, whiteLabel: true, maxClients: 500 },
};

// ── Dashboard Widget Preferences ──
export const DASHBOARD_WIDGETS = {
  closeDateAlerts: "Close Date Alerts",
  revenueStats:    "Revenue Stats",
  incomeGoalBar:   "Annual Goal Ring",
  pipelineSummary: "Pipeline Summary",
  followUpAlerts:  "Follow-Up Alerts",
  dailyCheckIn:    "Daily Check-In",
  weeklyHours:     "Weekly Hours",
  goalProgress:    "Goal Progress",
} as const;

export type DashboardWidgetKey = keyof typeof DASHBOARD_WIDGETS;
export type DashboardWidgetPrefs = Record<DashboardWidgetKey, boolean>;

export const DEFAULT_WIDGET_PREFS: DashboardWidgetPrefs = {
  closeDateAlerts: true, revenueStats: true, incomeGoalBar: true,
  pipelineSummary: true, followUpAlerts: true, dailyCheckIn: true,
  weeklyHours: true, goalProgress: true,
};

// ── Shared User (replaces UserProfile — matches Hearth's User type) ──
export interface SharedUser {
  id: string;
  email: string;
  displayName: string;
  phone: string;
  roles: ("agent" | "buyer" | "seller" | "dual")[];
  status: "pending" | "active";
  activeRole?: "buyer" | "seller";
  avatarUrl?: string;
  dashboardWidgets?: DashboardWidgetPrefs;
  brokerageId: string;
  subscription: Subscription;
  createdAt: number;
  lastLoginAt: number;
}

// ── Shared Transaction (bridge between RE Tracker deals and Hearth) ──
export type SharedTransactionStatus = "active" | "under-contract" | "closed" | "withdrawn";

export interface SharedTransaction {
  id: string;
  brokerageId: string;
  clientId: string; // Hearth user ID
  agentId: string;
  type: "buying" | "selling";
  status: SharedTransactionStatus;
  label: string;
  hearthPortalActive: boolean;
  reTrackerDealId: string;
  reTrackerClientId: string;
  createdAt: number;
  updatedAt: number;
}

// ── Milestone (subcollection of /transactions/{id}/milestones/{mId}) ──
export interface Milestone {
  id: string;
  label: string;
  stage: string;
  completed: boolean;
  completedAt: number | null;
  completedBy: string | null;
  clientVisible: boolean;
  notifyClient: boolean;
}
