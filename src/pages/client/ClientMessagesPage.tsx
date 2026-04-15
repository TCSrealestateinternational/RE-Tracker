import { useAuth } from "@/context/AuthContext";
import { useConversations } from "@/hooks/useConversations";
import { ConversationList } from "@/components/messaging/ConversationList";
import { MessageThread } from "@/components/messaging/MessageThread";
import { Icon } from "@/components/shared/Icon";
import { t, card } from "@/styles/theme";
import { useState } from "react";

export function ClientMessagesPage() {
  const { user, profile } = useAuth();
  const { conversations, loading } = useConversations();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  if (loading) {
    return (
      <div style={{ ...card, textAlign: "center", padding: "32px" }}>
        <p style={{ ...t.body, color: t.textTertiary }}>Loading messages...</p>
      </div>
    );
  }

  if (activeConversationId && activeConversation) {
    return (
      <div style={{ display: "grid", gap: "0px", height: "calc(100vh - 180px)" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 0",
        }}>
          <button
            onClick={() => setActiveConversationId(null)}
            aria-label="Back to conversations"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "44px",
              minHeight: "44px",
              borderRadius: "12px",
              color: t.textSecondary,
            }}
          >
            <Icon name="arrow_back" size={20} />
          </button>
          <h2 style={{ ...t.sectionHeader, color: t.text }}>
            Your Agent
          </h2>
        </div>
        <MessageThread
          conversationId={activeConversationId}
          currentUserId={user?.uid || ""}
          currentUserRole={profile?.roles?.[0] || "buyer"}
        />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div style={{ display: "grid", gap: "20px" }}>
        <h1 style={{ ...t.pageTitle, color: t.text }}>Messages</h1>
        <div style={{ ...card, textAlign: "center", padding: "32px" }}>
          <Icon name="chat" size={32} color={t.textTertiary} />
          <p style={{ ...t.body, color: t.textTertiary, marginTop: "12px" }}>
            No messages yet. Your agent will reach out when there are updates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <h1 style={{ ...t.pageTitle, color: t.text }}>Messages</h1>
      <ConversationList
        conversations={conversations}
        currentUserId={user?.uid || ""}
        onSelect={(id) => setActiveConversationId(id)}
      />
    </div>
  );
}
