// ── IRS Standard Mileage Rate (2024) ──
export const MILEAGE_RATE = 0.67;

// ── Quarterly Estimated Tax Dates ──
export const QUARTERLY_TAX_DATES = [
  { quarter: "Q1", deadline: "April 15", period: "Jan 1 – Mar 31" },
  { quarter: "Q2", deadline: "June 15", period: "Apr 1 – May 31" },
  { quarter: "Q3", deadline: "September 15", period: "Jun 1 – Aug 31" },
  { quarter: "Q4", deadline: "January 15 (next year)", period: "Sep 1 – Dec 31" },
];

export interface FinanceTip {
  id: string;
  title: string;
  body: string;
  icon: string;
}

export type TipCategory = "deductions" | "bestPractices" | "commonMistakes" | "taxCalendar";

export const TIP_CATEGORY_LABELS: Record<TipCategory, string> = {
  deductions: "Deductions",
  bestPractices: "Best Practices",
  commonMistakes: "Common Mistakes",
  taxCalendar: "Tax Calendar",
};

export const FINANCE_TIPS: Record<TipCategory, FinanceTip[]> = {
  deductions: [
    {
      id: "d1",
      title: "Vehicle & Mileage",
      body: "Track every business mile — showings, inspections, office trips, and client meetings. The IRS standard rate is $0.67/mile for 2024. If you work from a home office, your commute to the first showing and back counts as business mileage.",
      icon: "directions_car",
    },
    {
      id: "d2",
      title: "Marketing & Advertising",
      body: "Business cards, yard signs, flyers, photography, staging, social media ads, website hosting, MLS fees, and virtual tour costs are all deductible marketing expenses.",
      icon: "campaign",
    },
    {
      id: "d3",
      title: "Licensing & Dues",
      body: "NAR, state, and local board dues; MLS fees; license renewal fees; E&O insurance premiums; and lock box fees are deductible business expenses.",
      icon: "badge",
    },
    {
      id: "d4",
      title: "Technology & Equipment",
      body: "Your phone, laptop, tablet, CRM subscription, e-signature tools, transaction management software, and other tech you use for business can be deducted (business-use percentage if personal too).",
      icon: "devices",
    },
    {
      id: "d5",
      title: "Education & Training",
      body: "Continuing education courses, designations (CRS, ABR, SRS), coaching programs, conference fees, and travel to industry events are deductible — as long as they maintain or improve skills for your current profession.",
      icon: "school",
    },
    {
      id: "d6",
      title: "Home Office",
      body: "If you use a dedicated space exclusively for business, you can deduct it. Simplified method: $5/sq ft up to 300 sq ft ($1,500 max). Regular method: percentage of rent/mortgage, utilities, insurance, and repairs.",
      icon: "home_work",
    },
    {
      id: "d7",
      title: "Insurance",
      body: "E&O (Errors & Omissions) insurance, business liability insurance, and the self-employed health insurance deduction (100% of premiums for you, spouse, and dependents if not eligible for employer plan).",
      icon: "shield",
    },
    {
      id: "d8",
      title: "Client Meals & Gifts",
      body: "Business meals with clients are 50% deductible (must discuss business). Client gifts are deductible up to $25 per person per year. Closing gifts, housewarming gifts, and holiday gifts all count.",
      icon: "restaurant",
    },
    {
      id: "d9",
      title: "Professional Services",
      body: "Tax preparer/CPA fees, attorney fees for business matters, bookkeeping services, virtual assistant costs, and transaction coordinator fees are deductible.",
      icon: "support_agent",
    },
    {
      id: "d10",
      title: "Retirement Contributions",
      body: "As a 1099, you can open a SEP-IRA (up to 25% of net earnings, max ~$66,000) or a Solo 401(k). These reduce your taxable income dollar-for-dollar and build retirement savings.",
      icon: "savings",
    },
  ],
  bestPractices: [
    {
      id: "bp1",
      title: "Separate Business & Personal Accounts",
      body: "Open a dedicated business checking account and credit card. Run all business expenses through them. This makes tracking automatic and keeps your records clean for audits.",
      icon: "account_balance",
    },
    {
      id: "bp2",
      title: "Track Expenses in Real Time",
      body: "Log expenses the same day they happen. Waiting until tax time means you'll miss deductions. Even 5 missed $20 expenses per week = $5,200/year in lost deductions.",
      icon: "bolt",
    },
    {
      id: "bp3",
      title: "Weekly 15-Minute Review",
      body: "Set a weekly calendar reminder to review and categorize the week's expenses. This keeps you on top of your finances without it becoming a big task.",
      icon: "event_repeat",
    },
    {
      id: "bp4",
      title: "Keep Receipts Over $75",
      body: "The IRS doesn't require receipts for expenses under $75 (except lodging), but keeping them is good practice. Snap a photo with your phone and note the business purpose.",
      icon: "receipt_long",
    },
    {
      id: "bp5",
      title: "Mileage Log Requirements",
      body: "The IRS requires a 'contemporaneous' mileage log — recorded at or near the time of the trip. Include date, destination, business purpose, and miles driven. Reconstructed logs at year-end can be disallowed.",
      icon: "edit_note",
    },
  ],
  commonMistakes: [
    {
      id: "cm1",
      title: "Not Separating Accounts",
      body: "Mixing personal and business expenses makes tracking nearly impossible and raises red flags during audits. It's the #1 mistake new agents make.",
      icon: "warning",
    },
    {
      id: "cm2",
      title: "Reconstructed Mileage Logs",
      body: "Writing up your mileage log from memory at year-end is technically not 'contemporaneous' and the IRS can deny the entire deduction. Log trips as they happen.",
      icon: "history",
    },
    {
      id: "cm3",
      title: "Missing Small Deductions",
      body: "Parking meters, postage, key copies, lock box batteries — small expenses add up. A $5/day average in missed small expenses = $1,825/year in lost deductions.",
      icon: "money_off",
    },
    {
      id: "cm4",
      title: "Overclaiming Meals",
      body: "Only meals where business is actually discussed are deductible (50%). Grabbing lunch by yourself between showings generally doesn't qualify unless you're traveling away from your tax home.",
      icon: "no_meals",
    },
    {
      id: "cm5",
      title: "Skipping Quarterly Payments",
      body: "As a 1099, you owe estimated taxes quarterly. Missing payments triggers underpayment penalties. Set aside 25-30% of every commission check in a separate savings account.",
      icon: "event_busy",
    },
    {
      id: "cm6",
      title: "Deducting Pre-License Education",
      body: "Costs to get your initial real estate license are NOT deductible (they qualify you for a new profession). Only continuing education and post-license training qualify.",
      icon: "block",
    },
    {
      id: "cm7",
      title: "Ignoring the QBI Deduction",
      body: "The Qualified Business Income (QBI) deduction lets you deduct up to 20% of net business income. Many agents don't know about it or don't claim it. Talk to your CPA about Section 199A.",
      icon: "lightbulb",
    },
  ],
  taxCalendar: [
    {
      id: "tc1",
      title: "Q1 Estimated Tax — April 15",
      body: "Covers income earned January 1 through March 31. This is also the annual tax return deadline (or extension filing deadline).",
      icon: "event",
    },
    {
      id: "tc2",
      title: "Q2 Estimated Tax — June 15",
      body: "Covers income earned April 1 through May 31. Yes, it's only a 2-month quarter — it catches many agents off guard.",
      icon: "event",
    },
    {
      id: "tc3",
      title: "Q3 Estimated Tax — September 15",
      body: "Covers income earned June 1 through August 31. This is a 3-month quarter and often the highest payment for agents (summer closings).",
      icon: "event",
    },
    {
      id: "tc4",
      title: "Q4 Estimated Tax — January 15",
      body: "Covers income earned September 1 through December 31. Due January 15 of the following year. If you file your return and pay all tax by January 31, you can skip this payment.",
      icon: "event",
    },
    {
      id: "tc5",
      title: "Safe Harbor Rule",
      body: "To avoid underpayment penalties, pay at least 100% of last year's tax liability (110% if AGI > $150k) or 90% of this year's liability, whichever is smaller. When in doubt, use last year's tax as the baseline.",
      icon: "verified_user",
    },
  ],
};
