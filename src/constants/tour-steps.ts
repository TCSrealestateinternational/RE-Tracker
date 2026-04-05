export interface TourStep {
  target: string;
  title: string;
  content: string;
  placement: "top" | "bottom" | "left" | "right";
}

export interface TourDefinition {
  id: string;
  steps: TourStep[];
}

export const TOUR_DEFINITIONS: Record<string, TourDefinition> = {
  "/": {
    id: "dashboard",
    steps: [
      {
        target: "sidebar-nav",
        title: "Navigation",
        content: "Use the sidebar to jump between Timer, Clients, Pipeline, and more. Each section tracks a different part of your business.",
        placement: "right",
      },
      {
        target: "revenue-stats",
        title: "Revenue Stats",
        content: "See your total hours, prospective and closed GCI, and revenue per hour at a glance.",
        placement: "bottom",
      },
      {
        target: "daily-checkin",
        title: "Daily Check-In",
        content: "Log whether you prospected today and how many contacts you made. Build a streak to stay consistent.",
        placement: "bottom",
      },
      {
        target: "income-goal",
        title: "Income Goal",
        content: "Track your annual GCI target and see whether you're on pace throughout the year.",
        placement: "bottom",
      },
      {
        target: "follow-ups",
        title: "Follow-Up Alerts",
        content: "Clients with follow-up dates due today or earlier show here so nothing slips through the cracks.",
        placement: "top",
      },
      {
        target: "pipeline-summary",
        title: "Pipeline Summary",
        content: "A quick count of deals at each stage — from New Lead to Closed — plus your total active pipeline value.",
        placement: "top",
      },
    ],
  },
  "/timer": {
    id: "timer",
    steps: [
      {
        target: "live-timer",
        title: "Live Timer",
        content: "Start and stop a timer to automatically track time spent on prospecting, showings, admin, and more.",
        placement: "bottom",
      },
      {
        target: "manual-entry",
        title: "Manual Entry",
        content: "Forgot to start the timer? Add a time entry manually with the date, duration, and category.",
        placement: "bottom",
      },
      {
        target: "recent-entries",
        title: "Recent Entries",
        content: "Your last 10 time entries. Click any row to edit it, or use the trash icon to delete.",
        placement: "top",
      },
    ],
  },
  "/clients": {
    id: "clients",
    steps: [
      {
        target: "add-client",
        title: "Add Client",
        content: "Add a new buyer or seller client. A transaction checklist is created automatically.",
        placement: "bottom",
      },
      {
        target: "client-list",
        title: "Client List",
        content: "All your clients in one place. Click any row to see details, timeline, and checklist progress.",
        placement: "top",
      },
    ],
  },
  "/pipeline": {
    id: "pipeline",
    steps: [
      {
        target: "add-deal",
        title: "Add Deal",
        content: "Create a new deal and link it to a client. Track projected commission, close dates, and more.",
        placement: "bottom",
      },
      {
        target: "kanban-board",
        title: "Kanban Board",
        content: "Drag deals across stages — from New Lead to Closed. Each card shows key deal details.",
        placement: "top",
      },
    ],
  },
  "/reports": {
    id: "reports",
    steps: [
      {
        target: "report-tabs",
        title: "Report Types",
        content: "Switch between Hours, GCI, Revenue/Hour, and Lead Source reports to analyze your business.",
        placement: "bottom",
      },
      {
        target: "export-buttons",
        title: "Export",
        content: "Download your report data as CSV or PDF to share with your broker or keep for your records.",
        placement: "bottom",
      },
    ],
  },
  "/goals": {
    id: "goals",
    steps: [
      {
        target: "goal-setup",
        title: "Income Goal Setup",
        content: "Set your annual GCI target and average commission. The pace tracker will tell you if you're on track.",
        placement: "bottom",
      },
    ],
  },
  "/checklists": {
    id: "checklists",
    steps: [
      {
        target: "checklist-area",
        title: "Transaction Checklists",
        content: "Each client gets a buyer or seller checklist automatically. Track every step from contract to close.",
        placement: "bottom",
      },
    ],
  },
  "/referrals": {
    id: "referrals",
    steps: [
      {
        target: "add-referral",
        title: "Add Referral",
        content: "Track referrals you send or receive. Log the fee, status, and expected payout date.",
        placement: "bottom",
      },
    ],
  },
};
