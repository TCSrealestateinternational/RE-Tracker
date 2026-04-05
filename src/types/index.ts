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
export const SELLER_CHECKLIST_ITEMS = [
  "Initial seller consultation",
  "Property walkthrough and notes",
  "Comparative market analysis",
  "Pricing strategy conversation",
  "Listing agreement signed",
  "Coordinate professional photography",
  "Coordinate video or virtual tour",
  "Staging consultation or recommendations",
  "Write MLS listing description",
  "Input listing into MLS",
  "Install yard sign and lockbox",
  "Create marketing materials",
  "Launch social media marketing campaign",
  "Syndicate to Zillow, Realtor.com, etc.",
  "Schedule and host showings",
  "Collect and review showing feedback",
  "Host open house",
  "Review and present all offers to seller",
  "Negotiate offer terms",
  "Countersign accepted contract",
  "Confirm connection with title company",
  "Notify all parties — lender, title, attorneys",
  "Request mortgage payoff statement for seller",
  "Schedule interpreter for closing if needed",
  "Coordinate inspection scheduling",
  "Review inspection report with seller",
  "Negotiate inspection repairs or credits",
  "Order appraisal or coordinate access",
  "Review appraisal with seller",
  "Monitor financing contingency deadlines",
  "Coordinate title search",
  "Review title commitment for issues",
  "Schedule final walk-through",
  "Confirm closing date and location with all parties",
  "Review closing disclosure with seller",
  "Attend closing",
  "Confirm proceeds delivered to seller",
  "Follow up after closing",
] as const;

export const BUYER_CHECKLIST_ITEMS = [
  "Initial buyer consultation",
  "Understand wants, needs, and must-haves",
  "Confirm pre-approval or connect with lender",
  "Set up MLS search with buyer criteria",
  "Send and review listings with buyer",
  "Schedule and conduct showings",
  "Research properties before showings",
  "Provide neighborhood and market insights",
  "Advise on offer strategy",
  "Write and submit offer",
  "Negotiate offer terms and price",
  "Send accepted contract to lender",
  "Send accepted contract to title company",
  "Request title company to collect earnest money",
  "Schedule home inspection",
  "Attend home inspection",
  "Review inspection report with buyer",
  "Negotiate repairs or credits after inspection",
  "Coordinate appraisal access",
  "Review appraisal results with buyer",
  "Monitor financing contingency and deadlines",
  "Coordinate title search",
  "Review title commitment with buyer",
  "Review HOA documents if applicable",
  "Confirm homeowners insurance is in place",
  "Survey coordination if required",
  "Review closing disclosure with buyer",
  "Schedule and attend final walk-through",
  "Confirm closing date, time, and location",
  "Attend closing",
  "Hand over keys",
  "Follow up after closing",
] as const;

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
