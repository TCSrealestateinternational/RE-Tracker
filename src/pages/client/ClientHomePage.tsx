import { useAuth } from "@/context/AuthContext";
import { useClientTransaction } from "@/hooks/useClientTransaction";
import { Icon } from "@/components/shared/Icon";
import { t, card } from "@/styles/theme";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function ClientHomePage() {
  const { profile } = useAuth();
  const { transaction, milestones, loading } = useClientTransaction();

  const firstName = profile?.displayName?.split(" ")[0] || "there";

  // Calculate journey progress from milestones
  const visibleMilestones = milestones.filter((m) => m.clientVisible);
  const completedMilestones = visibleMilestones.filter((m) => m.completed);
  const progressPct = visibleMilestones.length > 0
    ? Math.round((completedMilestones.length / visibleMilestones.length) * 100)
    : 0;

  const isBuying = transaction?.type === "buying";
  const statusLabel = transaction?.status === "under-contract" ? "Under Contract"
    : transaction?.status === "active" ? "Active"
    : transaction?.status === "closed" ? "Closed"
    : "Getting Started";

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      {/* Hero greeting */}
      <section>
        <h1 style={{
          ...t.pageTitle,
          color: t.text,
          marginBottom: "4px",
        }}>
          {getGreeting()}, {firstName}
        </h1>
        <p style={{ ...t.body, color: t.textTertiary }}>
          {transaction
            ? `Your ${isBuying ? "home buying" : "home selling"} journey`
            : "Welcome to your client portal"}
        </p>
      </section>

      {loading && (
        <div style={{ ...card, textAlign: "center", padding: "32px" }}>
          <p style={{ ...t.body, color: t.textTertiary }}>Loading your dashboard...</p>
        </div>
      )}

      {!loading && transaction && (
        <>
          {/* Progress card */}
          <section style={card} aria-label="Journey progress">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Icon name="route" size={18} color={t.teal} />
                <h2 style={{ ...t.sectionHeader, color: t.text }}>Your Journey</h2>
              </div>
              <span style={{
                padding: "4px 12px",
                borderRadius: "100px",
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                background: t.primaryContainer,
                color: t.teal,
              }}>
                {statusLabel}
              </span>
            </div>
            <div style={{ marginBottom: "8px" }}>
              <div style={{
                height: "3px",
                background: t.surfaceContainerHigh,
                borderRadius: "2px",
                overflow: "hidden",
              }}>
                <div
                  role="progressbar"
                  aria-valuenow={progressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Journey progress: ${progressPct}%`}
                  style={{
                    height: "100%",
                    width: `${progressPct}%`,
                    background: progressPct === 100 ? t.success : t.teal,
                    borderRadius: "2px",
                    transition: "width 0.3s",
                  }}
                />
              </div>
            </div>
            <p style={{ ...t.caption, color: t.textTertiary }}>
              {completedMilestones.length} of {visibleMilestones.length} milestones completed ({progressPct}%)
            </p>
          </section>

          {/* Next steps cards — horizontal scroll */}
          {visibleMilestones.length > 0 && (
            <section aria-label="Next steps">
              <h2 style={{ ...t.label, color: t.textSecondary, marginBottom: "12px" }}>
                Next Steps
              </h2>
              <div style={{
                display: "flex",
                gap: "12px",
                overflowX: "auto",
                paddingBottom: "4px",
                scrollSnapType: "x mandatory",
                WebkitOverflowScrolling: "touch",
              }}>
                {visibleMilestones
                  .filter((m) => !m.completed)
                  .slice(0, 5)
                  .map((milestone) => (
                    <div
                      key={milestone.id}
                      style={{
                        ...card,
                        minWidth: "200px",
                        maxWidth: "240px",
                        flexShrink: 0,
                        scrollSnapAlign: "start",
                        padding: "16px",
                      }}
                    >
                      <Icon name="radio_button_unchecked" size={16} color={t.teal} style={{ marginBottom: "8px" }} />
                      <p style={{ ...t.body, color: t.text, fontWeight: 500 }}>
                        {milestone.label}
                      </p>
                      <p style={{ ...t.caption, color: t.textTertiary, marginTop: "4px" }}>
                        {milestone.stage}
                      </p>
                    </div>
                  ))}
              </div>
            </section>
          )}
        </>
      )}

      {!loading && !transaction && (
        <section style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Icon name="waving_hand" size={18} color={t.teal} />
            <h2 style={{ ...t.sectionHeader, color: t.text }}>Welcome</h2>
          </div>
          <div style={{ display: "grid", gap: "8px" }}>
            {[
              "Your agent is setting up your transaction.",
              "Check back here for milestones, action items, and key dates.",
              "Use the Messages tab to stay in touch with your agent.",
            ].map((tip, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "10px 14px",
                  background: t.surfaceContainerLow,
                  borderRadius: "12px",
                }}
              >
                <Icon name="check_circle" size={14} color={t.teal} style={{ marginTop: "2px", flexShrink: 0 }} />
                <span style={{ ...t.body, color: t.text }}>{tip}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
