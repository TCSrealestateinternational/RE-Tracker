// ── Brand Tokens & Brokerage ──
export interface BrandTokens {
  primary: string;
  primaryLight: string;
  secondary: string;
  cta: string;
  ctaHover: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  surfaceContainer?: string;
  surfaceContainerHigh?: string;
}

export const defaultBrandTokens: BrandTokens = {
  primary: "#2F5233",
  primaryLight: "#E8F5E9",
  secondary: "#1A3C5E",
  cta: "#C8A96E",
  ctaHover: "#B8994E",
  background: "#FAFAF5",
  surface: "#FFFFFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#5A5A5A",
  border: "#E0E0E0",
  success: "#2F7A4F",
  warning: "#D4A843",
  error: "#C0392B",
};

export interface Brokerage {
  id: string;
  slug: string;
  name: string;
  agentName: string;
  agentTitle: string;
  agentEmail: string;
  agentPhone: string;
  licenseNumber: string;
  logoUrl: string;
  brandTokens: BrandTokens;
  driveFolderUrl?: string;
  createdAt: number;
}

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

export type OfferStatus = "accepted" | "countered" | "rejected" | "withdrawn";

export interface Offer {
  amount: number;
  status: OfferStatus;
  rejectedAt?: string;
  withdrawnAt?: string;
}

export interface DriveLink {
  label: string;
  url: string;
}

export interface ClientNote {
  id: string;
  text: string;
  createdAt: number; // Date.now() timestamp
  authorName: string;
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

  // Timestamped notes log
  noteEntries?: ClientNote[];

  // Archive lifecycle
  archivedAt?: number;                 // set when archived; cleared when un-archived
  oneYearReminderDate?: string;        // YYYY-MM-DD
  oneYearReminderHandledAt?: number;   // set when agent dismisses/reaches out

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
  "Released",
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

export interface ChecklistItemMeta {
  completedAt: number;
  completedBy: string; // userId
  completedByName: string; // display name
}

export interface TransactionChecklist {
  id: string;
  userId: string;
  clientId: string;
  type: "buyer" | "seller";
  items: Record<string, boolean>;
  itemMeta?: Record<string, ChecklistItemMeta>; // who checked it + when
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
export type ReferralStatus = "pending" | "searching" | "pre-listing" | "listed" | "under-contract" | "closed" | "paid" | "lost";

export const REFERRAL_STATUS_LABELS: Record<ReferralStatus, string> = {
  pending: "Pending",
  searching: "Searching for a Home",
  "pre-listing": "Pre-Listing",
  listed: "Listed",
  "under-contract": "Under Contract",
  closed: "Closed",
  paid: "Paid",
  lost: "Lost",
};

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

// ── Expenses ──
export const EXPENSE_CATEGORIES = [
  "Vehicle & Mileage",
  "Marketing & Advertising",
  "Licensing & Dues",
  "Technology & Equipment",
  "Education & Training",
  "Home Office",
  "Insurance",
  "Client Meals & Gifts",
  "Professional Services",
  "Office & Desk Fees",
  "Commission Splits",
  "Retirement Contributions",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface Expense {
  id: string;
  userId: string;
  type: "expense" | "mileage";
  date: string; // YYYY-MM-DD
  description: string;
  category: ExpenseCategory;
  amount: number;
  dealId: string | null;
  clientId: string | null;
  notes: string;
  // Mileage-specific
  miles: number | null;
  mileageRate: number | null;
  destination: string;
  roundTrip: boolean;
  // Receipt
  hasReceipt: boolean;
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
  closeDateAlerts:   "Close Date Alerts",
  revenueStats:      "Revenue Stats",
  incomeGoalBar:     "Annual Goal Ring",
  pipelineSummary:   "Pipeline Summary",
  followUpAlerts:    "Follow-Up Alerts",
  dailyCheckIn:      "Daily Check-In",
  weeklyHours:       "Weekly Hours",
  goalProgress:      "Goal Progress",
  oneYearReminders:  "1-Year Reach-Outs",
  expenseSummary:    "Expense Summary",
} as const;

export type DashboardWidgetKey = keyof typeof DASHBOARD_WIDGETS;
export type DashboardWidgetPrefs = Record<DashboardWidgetKey, boolean>;

export const DEFAULT_WIDGET_PREFS: DashboardWidgetPrefs = {
  closeDateAlerts: true, revenueStats: true, incomeGoalBar: true,
  pipelineSummary: true, followUpAlerts: true, dailyCheckIn: true,
  weeklyHours: true, goalProgress: true, oneYearReminders: true,
  expenseSummary: true,
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

// ── Sync Permissions ──
export type SyncPermissionKey = "status" | "milestones" | "documents" | "property" | "messages" | "checklist" | "finance" | "offers";

export type SyncPermissions = Record<SyncPermissionKey, boolean>;

export interface PermissionChangeEntry {
  action: "invite_sent" | "invite_accepted" | "permission_updated" | "sync_paused" | "sync_resumed";
  timestamp: number;
  changedBy: string; // userId
  field?: SyncPermissionKey;
  oldValue?: boolean;
  newValue?: boolean;
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
  syncPermissions?: SyncPermissions;
  permissionHistory?: PermissionChangeEntry[];
  syncPausedAt?: number;
  clientFirstLoginAt?: number;
  archivedAt?: number;
  releaseReason?: string;
  releasedAt?: number;
  previousTransactionId?: string; // links new tx back to the released one
  relistCount?: number; // how many times a seller has relisted (starts at 0)
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

// ── Offer Tracking ──
export type TrackedOfferStatus =
  | "draft"
  | "submitted"
  | "countered"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "expired";

export interface OfferTimelineEvent {
  status: TrackedOfferStatus;
  timestamp: number;
  note?: string;
}

export interface TrackedOffer {
  id: string;
  transactionId: string;
  propertyAddress: string;
  offerAmount: number;
  status: TrackedOfferStatus;
  submittedAt: number | null;
  respondedAt: number | null;
  counterAmount?: number;
  notes: string;
  timeline: OfferTimelineEvent[];
  createdAt: number;
  updatedAt: number;
}

// ── Home Wish List ──
export type WishListPriority = "must-have" | "nice-to-have" | "dealbreaker";

export interface WishListItem {
  id: string;
  text: string;
  priority: WishListPriority;
  sortOrder: number;
  createdAt: number;
}

export interface WishListData {
  items: WishListItem[];
  updatedAt: number;
}

// ── Neighborhood Data (mock) ──
export interface SchoolRating {
  name: string;
  type: "elementary" | "middle" | "high";
  rating: number;
  distance: string;
}

export interface NeighborhoodScores {
  walkScore: number;
  transitScore: number;
  bikeScore: number;
  schools: SchoolRating[];
  crimeIndex: number;
  commuteMinutes: number;
}

// ── Messaging (flat model — shared with Hearth) ──
export interface Message {
  id: string;
  brokerageId: string;
  threadId: string;        // = clientId
  senderId: string;
  senderName: string;
  senderRole: "agent" | "client";
  text: string;
  fileUrl?: string;
  fileName?: string;
  readAt?: number;
  createdAt: number;
}

export interface Thread {
  id: string;              // = clientId / threadId
  clientName: string;
  lastMessage: string;
  lastMessageAt: number;
  unreadCount: number;
}

// ── Closing Cost Estimator ──
export type LoanType = "conventional" | "fha" | "va" | "usda";

export interface ClosingCostLineItem {
  label: string;
  amount: number;
  isPercentage: boolean;
  percentValue?: number;
}
