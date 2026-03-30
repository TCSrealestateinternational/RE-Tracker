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
  createdAt: number;
  updatedAt: number;
}

export interface TimeEntry {
  id: string;
  userId: string;
  category: ActivityCategory;
  clientId: string | null;
  note: string;
  startTime: number;
  endTime: number | null;
  durationMs: number;
  manual: boolean;
  createdAt: number;
}

export interface WeeklyGoal {
  userId: string;
  category: ActivityCategory;
  targetHours: number;
}
