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

export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  additionalContacts: ContactPerson[];
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
  actualCloseDate: string | null;
  leadSource: LeadSource | "";
  notes: string;
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
  "Notify all parties — lender, title, attorneys",
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
  "Deliver earnest money to escrow",
  "Notify lender of accepted contract",
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
