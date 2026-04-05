export interface MilestoneMapping {
  milestoneId: string;
  label: string;
  stage: string;
  defaultClientVisible: boolean;
  defaultNotifyClient: boolean;
}

// ── Buyer checklist items → Hearth milestones ──
export const BUYER_MILESTONE_MAP: Record<string, MilestoneMapping> = {
  "Confirm pre-approval or connect with lender": {
    milestoneId: "buyer-pre-approval",
    label: "Pre-approval confirmed",
    stage: "Getting Started",
    defaultClientVisible: true,
    defaultNotifyClient: true,
  },
  "Write and submit offer": {
    milestoneId: "buyer-offer-submitted",
    label: "Offer submitted",
    stage: "Making an Offer",
    defaultClientVisible: true,
    defaultNotifyClient: true,
  },
  "Negotiate offer terms and price": {
    milestoneId: "buyer-offer-negotiated",
    label: "Offer terms negotiated",
    stage: "Making an Offer",
    defaultClientVisible: true,
    defaultNotifyClient: false,
  },
  "Schedule home inspection": {
    milestoneId: "buyer-inspection-scheduled",
    label: "Home inspection scheduled",
    stage: "Under Contract",
    defaultClientVisible: true,
    defaultNotifyClient: true,
  },
  "Review inspection report with buyer": {
    milestoneId: "buyer-inspection-reviewed",
    label: "Inspection report reviewed",
    stage: "Under Contract",
    defaultClientVisible: true,
    defaultNotifyClient: true,
  },
  "Coordinate appraisal access": {
    milestoneId: "buyer-appraisal",
    label: "Appraisal coordinated",
    stage: "Under Contract",
    defaultClientVisible: true,
    defaultNotifyClient: true,
  },
  "Review closing disclosure with buyer": {
    milestoneId: "buyer-closing-disclosure",
    label: "Closing disclosure reviewed",
    stage: "Closing",
    defaultClientVisible: true,
    defaultNotifyClient: true,
  },
  "Attend closing": {
    milestoneId: "buyer-closing",
    label: "Closing complete",
    stage: "Closing",
    defaultClientVisible: true,
    defaultNotifyClient: true,
  },
  "Hand over keys": {
    milestoneId: "buyer-keys",
    label: "Keys handed over",
    stage: "Closing",
    defaultClientVisible: true,
    defaultNotifyClient: true,
  },
};

// ── Seller checklist items → Hearth milestones ──
export const SELLER_MILESTONE_MAP: Record<string, MilestoneMapping> = {
  "Listing agreement signed": {
    milestoneId: "seller-listing-agreement",
    label: "Listing agreement signed",
    stage: "Getting Started",
    defaultClientVisible: true,
    defaultNotifyClient: true,
  },
  "Input listing into MLS": {
    milestoneId: "seller-mls-live",
    label: "Listed on MLS",
    stage: "Marketing",
    defaultClientVisible: true,
    defaultNotifyClient: true,
  },
  "Review and present all offers to seller": {
    milestoneId: "seller-offers-presented",
    label: "Offers presented",
    stage: "Offers",
    defaultClientVisible: true,
    defaultNotifyClient: true,
  },
  "Countersign accepted contract": {
    milestoneId: "seller-contract-accepted",
    label: "Contract accepted",
    stage: "Under Contract",
    defaultClientVisible: true,
    defaultNotifyClient: true,
  },
  "Coordinate inspection scheduling": {
    milestoneId: "seller-inspection-scheduled",
    label: "Inspection scheduled",
    stage: "Under Contract",
    defaultClientVisible: true,
    defaultNotifyClient: true,
  },
  "Review inspection report with seller": {
    milestoneId: "seller-inspection-reviewed",
    label: "Inspection report reviewed",
    stage: "Under Contract",
    defaultClientVisible: true,
    defaultNotifyClient: true,
  },
  "Order appraisal or coordinate access": {
    milestoneId: "seller-appraisal",
    label: "Appraisal coordinated",
    stage: "Under Contract",
    defaultClientVisible: true,
    defaultNotifyClient: true,
  },
  "Review closing disclosure with seller": {
    milestoneId: "seller-closing-disclosure",
    label: "Closing disclosure reviewed",
    stage: "Closing",
    defaultClientVisible: true,
    defaultNotifyClient: true,
  },
  "Attend closing": {
    milestoneId: "seller-closing",
    label: "Closing complete",
    stage: "Closing",
    defaultClientVisible: true,
    defaultNotifyClient: true,
  },
};

export function getMilestoneMapping(
  checklistType: "buyer" | "seller",
  itemKey: string,
): MilestoneMapping | null {
  const map = checklistType === "buyer" ? BUYER_MILESTONE_MAP : SELLER_MILESTONE_MAP;
  return map[itemKey] ?? null;
}
