import type { ChecklistTemplateItem } from "./checklist-buyer";

export const SELLER_STAGES = [
  "Pre-Listing",
  "Home Preparation",
  "Active Listing",
  "Offer Received",
  "Under Contract",
  "Inspection",
  "Appraisal",
  "Financing / Clear to Close",
  "Closing Prep",
  "Closing Day",
] as const;

export const SELLER_CHECKLIST_TEMPLATE: ChecklistTemplateItem[] = [
  // ── Pre-Listing ──
  { id: "s-1",  label: "Initial seller consultation",                         stage: "Pre-Listing" },
  { id: "s-2",  label: "Property walkthrough and notes",                      stage: "Pre-Listing" },
  { id: "s-3",  label: "Comparative market analysis",                         stage: "Pre-Listing" },
  { id: "s-4",  label: "Pricing strategy conversation",                       stage: "Pre-Listing" },
  { id: "s-5",  label: "Discuss selling timeline and goals",                  stage: "Pre-Listing" },
  { id: "s-6",  label: "Explain agency relationship and listing process",     stage: "Pre-Listing" },
  { id: "s-7",  label: "Review estimated net proceeds",                       stage: "Pre-Listing" },
  { id: "s-8",  label: "Listing agreement signed",                            stage: "Pre-Listing" },

  // ── Home Preparation ──
  { id: "s-9",  label: "Staging consultation or recommendations",             stage: "Home Preparation" },
  { id: "s-10", label: "Recommend repairs or improvements for maximum value", stage: "Home Preparation" },
  { id: "s-11", label: "Coordinate professional photography",                 stage: "Home Preparation" },
  { id: "s-12", label: "Coordinate video or virtual tour",                    stage: "Home Preparation" },
  { id: "s-13", label: "Order pre-listing inspection if recommended",         stage: "Home Preparation" },
  { id: "s-14", label: "Declutter and depersonalize recommendations",         stage: "Home Preparation" },
  { id: "s-15", label: "Arrange for deep cleaning",                           stage: "Home Preparation" },
  { id: "s-16", label: "Write MLS listing description",                       stage: "Home Preparation" },

  // ── Active Listing ──
  { id: "s-17", label: "Input listing into MLS",                              stage: "Active Listing" },
  { id: "s-18", label: "Install yard sign and lockbox",                       stage: "Active Listing" },
  { id: "s-19", label: "Create marketing materials",                          stage: "Active Listing" },
  { id: "s-20", label: "Launch social media marketing campaign",              stage: "Active Listing" },
  { id: "s-21", label: "Syndicate to Zillow, Realtor.com, etc.",              stage: "Active Listing" },
  { id: "s-22", label: "Schedule and host showings",                          stage: "Active Listing" },
  { id: "s-23", label: "Collect and review showing feedback",                 stage: "Active Listing" },
  { id: "s-24", label: "Host open house",                                     stage: "Active Listing" },
  { id: "s-25", label: "Provide weekly activity reports to seller",           stage: "Active Listing" },
  { id: "s-26", label: "Discuss price adjustment if needed",                  stage: "Active Listing" },

  // ── Offer Received ──
  { id: "s-27", label: "Review and present all offers to seller",             stage: "Offer Received" },
  { id: "s-28", label: "Analyze offer terms, contingencies, and buyer qualifications", stage: "Offer Received" },
  { id: "s-29", label: "Compare multiple offers if applicable",               stage: "Offer Received" },
  { id: "s-30", label: "Advise seller on offer strength and strategy",        stage: "Offer Received" },
  { id: "s-31", label: "Negotiate offer terms",                               stage: "Offer Received" },
  { id: "s-32", label: "Send counter-offer if applicable",                    stage: "Offer Received" },
  { id: "s-33", label: "Receive buyer's response to counter",                 stage: "Offer Received" },
  { id: "s-34", label: "Countersign accepted contract",                       stage: "Offer Received" },

  // ── Under Contract ──
  { id: "s-35", label: "Confirm connection with title company",               stage: "Under Contract" },
  { id: "s-36", label: "Notify all parties — lender, title, attorneys",       stage: "Under Contract" },
  { id: "s-37", label: "Request mortgage payoff statement for seller",        stage: "Under Contract" },
  { id: "s-38", label: "Confirm earnest money deposited by buyer",            stage: "Under Contract" },
  { id: "s-39", label: "Review contract deadlines and contingency dates",     stage: "Under Contract" },
  { id: "s-40", label: "Set calendar reminders for key deadlines",            stage: "Under Contract" },
  { id: "s-41", label: "Schedule interpreter for closing if needed",          stage: "Under Contract" },
  { id: "s-42", label: "Open escrow with title company",                      stage: "Under Contract" },

  // ── Inspection ──
  { id: "s-43", label: "Coordinate inspection scheduling",                    stage: "Inspection" },
  { id: "s-44", label: "Prepare property for inspection",                     stage: "Inspection" },
  { id: "s-45", label: "Attend or be available during inspection",            stage: "Inspection" },
  { id: "s-46", label: "Review inspection report with seller",                stage: "Inspection" },
  { id: "s-47", label: "Negotiate inspection repairs or credits",             stage: "Inspection" },
  { id: "s-48", label: "Coordinate repair completion if agreed",              stage: "Inspection" },
  { id: "s-49", label: "Confirm buyer's inspection contingency cleared",      stage: "Inspection" },

  // ── Appraisal ──
  { id: "s-50", label: "Order appraisal or coordinate access",                stage: "Appraisal" },
  { id: "s-51", label: "Provide comparable sales to support list price",      stage: "Appraisal" },
  { id: "s-52", label: "Ensure property is clean and accessible for appraiser", stage: "Appraisal" },
  { id: "s-53", label: "Review appraisal with seller",                        stage: "Appraisal" },
  { id: "s-54", label: "Negotiate if appraisal is below contract price",      stage: "Appraisal" },
  { id: "s-55", label: "Confirm appraisal contingency cleared",               stage: "Appraisal" },

  // ── Financing / Clear to Close ──
  { id: "s-56", label: "Monitor financing contingency deadlines",             stage: "Financing / Clear to Close" },
  { id: "s-57", label: "Follow up with buyer's lender on loan status",        stage: "Financing / Clear to Close" },
  { id: "s-58", label: "Coordinate title search",                             stage: "Financing / Clear to Close" },
  { id: "s-59", label: "Review title commitment for issues",                  stage: "Financing / Clear to Close" },
  { id: "s-60", label: "Resolve any title defects or liens",                  stage: "Financing / Clear to Close" },
  { id: "s-61", label: "Confirm buyer has received clear-to-close",           stage: "Financing / Clear to Close" },
  { id: "s-62", label: "Verify all contingencies have been satisfied or waived", stage: "Financing / Clear to Close" },

  // ── Closing Prep ──
  { id: "s-63", label: "Schedule final walk-through",                         stage: "Closing Prep" },
  { id: "s-64", label: "Prepare property for final walk-through",             stage: "Closing Prep" },
  { id: "s-65", label: "Complete any outstanding repairs",                     stage: "Closing Prep" },
  { id: "s-66", label: "Gather all keys, remotes, and access codes",          stage: "Closing Prep" },
  { id: "s-67", label: "Arrange for utility transfers",                       stage: "Closing Prep" },
  { id: "s-68", label: "Review closing disclosure with seller",               stage: "Closing Prep" },
  { id: "s-69", label: "Compare closing disclosure to estimated net proceeds", stage: "Closing Prep" },
  { id: "s-70", label: "Confirm closing date and location with all parties",  stage: "Closing Prep" },
  { id: "s-71", label: "Prepare forwarding address for mail",                 stage: "Closing Prep" },
  { id: "s-72", label: "Confirm wire instructions for proceeds",              stage: "Closing Prep" },

  // ── Closing Day ──
  { id: "s-73", label: "Bring required identification to closing",            stage: "Closing Day" },
  { id: "s-74", label: "Review and sign closing documents",                   stage: "Closing Day" },
  { id: "s-75", label: "Attend closing",                                      stage: "Closing Day" },
  { id: "s-76", label: "Confirm deed is recorded",                            stage: "Closing Day" },
  { id: "s-77", label: "Confirm proceeds delivered to seller",                stage: "Closing Day" },
  { id: "s-78", label: "Hand over keys, remotes, and garage openers",         stage: "Closing Day" },
  { id: "s-79", label: "Cancel homeowners insurance after closing",           stage: "Closing Day" },
  { id: "s-80", label: "Follow up after closing",                             stage: "Closing Day" },
];
