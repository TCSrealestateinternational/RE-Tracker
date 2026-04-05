export interface ChecklistTemplateItem {
  id: string;
  label: string;
  stage: string;
}

export const BUYER_STAGES = [
  "Pre-Search",
  "Active Home Search",
  "Offer",
  "Under Contract",
  "Inspection",
  "Appraisal",
  "Financing / Clear to Close",
  "Closing Prep",
  "Closing Day",
] as const;

export const BUYER_CHECKLIST_TEMPLATE: ChecklistTemplateItem[] = [
  // ── Pre-Search ──
  { id: "b-1",  label: "Initial buyer consultation",                          stage: "Pre-Search" },
  { id: "b-2",  label: "Understand wants, needs, and must-haves",             stage: "Pre-Search" },
  { id: "b-3",  label: "Discuss budget and financing options",                stage: "Pre-Search" },
  { id: "b-4",  label: "Confirm pre-approval or connect with lender",         stage: "Pre-Search" },
  { id: "b-5",  label: "Review pre-approval letter details",                  stage: "Pre-Search" },
  { id: "b-6",  label: "Explain the buying process and timeline",             stage: "Pre-Search" },
  { id: "b-7",  label: "Discuss agency relationship and representation",      stage: "Pre-Search" },
  { id: "b-8",  label: "Buyer representation agreement signed",                stage: "Pre-Search" },
  { id: "b-9",  label: "Set up MLS search with buyer criteria",               stage: "Pre-Search" },
  { id: "b-10", label: "Identify target neighborhoods and school districts",  stage: "Pre-Search" },

  // ── Active Home Search ──
  { id: "b-11", label: "Send and review listings with buyer",                 stage: "Active Home Search" },
  { id: "b-12", label: "Research properties before showings",                 stage: "Active Home Search" },
  { id: "b-13", label: "Schedule and conduct showings",                       stage: "Active Home Search" },
  { id: "b-14", label: "Provide neighborhood and market insights",            stage: "Active Home Search" },
  { id: "b-15", label: "Review HOA documents if applicable",                  stage: "Active Home Search" },
  { id: "b-16", label: "Gather property disclosures for properties of interest", stage: "Active Home Search" },
  { id: "b-17", label: "Compare properties and narrow down choices",          stage: "Active Home Search" },
  { id: "b-18", label: "Revisit top properties for second showings",          stage: "Active Home Search" },
  { id: "b-19", label: "Evaluate property condition and potential issues",    stage: "Active Home Search" },
  { id: "b-20", label: "Confirm buyer is ready to make an offer",             stage: "Active Home Search" },

  // ── Offer ──
  { id: "b-21", label: "Advise on offer strategy",                            stage: "Offer" },
  { id: "b-22", label: "Run comparative market analysis for offer price",     stage: "Offer" },
  { id: "b-23", label: "Determine offer price",                               stage: "Offer" },
  { id: "b-24", label: "Decide on earnest money amount",                      stage: "Offer" },
  { id: "b-25", label: "Review contingencies (inspection, appraisal, financing)", stage: "Offer" },
  { id: "b-26", label: "Set offer expiration timeline",                       stage: "Offer" },
  { id: "b-27", label: "Write and submit offer",                              stage: "Offer" },
  { id: "b-28", label: "Negotiate offer terms and price",                     stage: "Offer" },
  { id: "b-29", label: "Receive seller's response",                           stage: "Offer" },
  { id: "b-30", label: "Ratify and fully execute the contract",               stage: "Offer" },

  // ── Under Contract ──
  { id: "b-31", label: "Send accepted contract to lender",                    stage: "Under Contract" },
  { id: "b-32", label: "Send accepted contract to title company",             stage: "Under Contract" },
  { id: "b-33", label: "Request title company to collect earnest money",      stage: "Under Contract" },
  { id: "b-34", label: "Confirm earnest money received by title company",     stage: "Under Contract" },
  { id: "b-35", label: "Notify all parties — lender, title, attorneys",       stage: "Under Contract" },
  { id: "b-36", label: "Review contract deadlines and contingency dates",     stage: "Under Contract" },
  { id: "b-37", label: "Set calendar reminders for key deadlines",            stage: "Under Contract" },
  { id: "b-38", label: "Order home warranty if applicable",                   stage: "Under Contract" },
  { id: "b-39", label: "Open escrow with title company",                      stage: "Under Contract" },
  { id: "b-40", label: "Confirm lender has begun processing",                 stage: "Under Contract" },

  // ── Inspection ──
  { id: "b-41", label: "Schedule home inspection",                            stage: "Inspection" },
  { id: "b-42", label: "Attend home inspection",                              stage: "Inspection" },
  { id: "b-43", label: "Schedule additional inspections if needed (radon, termite, sewer)", stage: "Inspection" },
  { id: "b-44", label: "Review inspection report with buyer",                 stage: "Inspection" },
  { id: "b-45", label: "Identify major vs. minor issues",                     stage: "Inspection" },
  { id: "b-46", label: "Prepare repair request or credit proposal",           stage: "Inspection" },
  { id: "b-47", label: "Negotiate repairs or credits after inspection",       stage: "Inspection" },
  { id: "b-48", label: "Receive seller's inspection response",                stage: "Inspection" },
  { id: "b-49", label: "Approve or waive inspection contingency",             stage: "Inspection" },

  // ── Appraisal ──
  { id: "b-50", label: "Coordinate appraisal access",                         stage: "Appraisal" },
  { id: "b-51", label: "Provide comparable sales to appraiser if needed",     stage: "Appraisal" },
  { id: "b-52", label: "Follow up on appraisal timeline",                     stage: "Appraisal" },
  { id: "b-53", label: "Review appraisal results with buyer",                 stage: "Appraisal" },
  { id: "b-54", label: "Address any appraisal shortfall if applicable",       stage: "Appraisal" },
  { id: "b-55", label: "Renegotiate price or terms if appraisal is low",      stage: "Appraisal" },
  { id: "b-56", label: "Approve or waive appraisal contingency",              stage: "Appraisal" },

  // ── Financing / Clear to Close ──
  { id: "b-57", label: "Monitor financing contingency and deadlines",         stage: "Financing / Clear to Close" },
  { id: "b-58", label: "Follow up with lender on underwriting status",        stage: "Financing / Clear to Close" },
  { id: "b-59", label: "Provide additional documents requested by lender",    stage: "Financing / Clear to Close" },
  { id: "b-60", label: "Confirm loan approval and clear-to-close",            stage: "Financing / Clear to Close" },
  { id: "b-61", label: "Review final loan terms and interest rate lock",       stage: "Financing / Clear to Close" },
  { id: "b-62", label: "Coordinate title search",                             stage: "Financing / Clear to Close" },
  { id: "b-63", label: "Review title commitment with buyer",                  stage: "Financing / Clear to Close" },
  { id: "b-64", label: "Resolve any title issues or exceptions",              stage: "Financing / Clear to Close" },
  { id: "b-65", label: "Confirm lender has sent closing documents to title",  stage: "Financing / Clear to Close" },
  { id: "b-66", label: "Obtain final loan commitment letter",                 stage: "Financing / Clear to Close" },

  // ── Closing Prep ──
  { id: "b-67", label: "Confirm homeowners insurance is in place",            stage: "Closing Prep" },
  { id: "b-68", label: "Survey coordination if required",                     stage: "Closing Prep" },
  { id: "b-69", label: "Review closing disclosure with buyer",                stage: "Closing Prep" },
  { id: "b-70", label: "Compare closing disclosure to loan estimate",         stage: "Closing Prep" },
  { id: "b-71", label: "Confirm wire transfer instructions with title company", stage: "Closing Prep" },
  { id: "b-72", label: "Schedule final walk-through",                         stage: "Closing Prep" },
  { id: "b-73", label: "Conduct final walk-through",                          stage: "Closing Prep" },
  { id: "b-74", label: "Verify all agreed-upon repairs are completed",        stage: "Closing Prep" },
  { id: "b-75", label: "Confirm closing date, time, and location",            stage: "Closing Prep" },
  { id: "b-76", label: "Confirm buyer has funds ready for closing",           stage: "Closing Prep" },

  // ── Closing Day ──
  { id: "b-77", label: "Review closing documents with buyer before signing",  stage: "Closing Day" },
  { id: "b-78", label: "Bring required identification to closing",            stage: "Closing Day" },
  { id: "b-79", label: "Wire funds or deliver cashier's check",               stage: "Closing Day" },
  { id: "b-80", label: "Sign all closing documents",                          stage: "Closing Day" },
  { id: "b-81", label: "Attend closing",                                      stage: "Closing Day" },
  { id: "b-82", label: "Confirm recording of deed",                           stage: "Closing Day" },
  { id: "b-83", label: "Hand over keys",                                      stage: "Closing Day" },
  { id: "b-84", label: "Provide home warranty information and local resources", stage: "Closing Day" },
  { id: "b-85", label: "Follow up after closing",                             stage: "Closing Day" },
];
