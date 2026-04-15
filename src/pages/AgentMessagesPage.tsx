import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useConversations } from "@/hooks/useConversations";
import { ConversationList } from "@/components/messaging/ConversationList";
import { MessageThread } from "@/components/messaging/MessageThread";
import { Icon } from "@/components/shared/Icon";
import { t, card } from "@/styles/theme";

export function AgentMessagesPage() {
  const { user } = useAuth();
  const { conversations, loading } = useConversations();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  return (
    <div style={{ display: "grid", gap: t.sectionGap }}>
      <div>
        <span style={{ ...t.eyebrow, color: t.gold, display: "block", marginBottom: "8px" }}>
          CLIENT COMMUNICATION
        </span>
        <h1 style={{ ...t.pageTitle, color: t.text }}>Messages</h1>
      </div>

      {loading ? (
        <div style={{ ...card, textAlign: "center", padding: "32px" }}>
          <p style={{ ...t.body, color: t.textTertiary }}>Loading conversations...</p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: activeConversationId ? "320px 1fr" : "1fr",
          gap: "20px",
          minHeight: "500px",
        }}>
          {/* Conversation list */}
          <div style={{
            ...(activeConversationId ? {} : {}),
          }}>
            <ConversationList
              conversations={conversations}
              currentUserId={user?.uid || ""}
              onSelect={(id) => setActiveConversationId(id)}
            />
            {conversations.length === 0 && (
              <div style={{ ...card, textAlign: "center", padding: "32px" }}>
                <Icon name="chat" size={32} color={t.textTertiary} />
                <p style={{ ...t.body, color: t.textTertiary, marginTop: "12px" }}>
                  No conversations yet. Conversations are created when you add clients to Hearth.
                </p>
              </div>
            )}
          </div>

          {/* Thread panel */}
          {activeConversationId && (
            <div style={{
              ...card,
              padding: "0 20px",
              display: "flex",
              flexDirection: "column",
              minHeight: "400px",
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "16px 0",
                borderBottom: `1px solid ${t.border}`,
              }}>
                <button
                  onClick={() => setActiveConversationId(null)}
                  aria-label="Close conversation"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    color: t.textSecondary,
                  }}
                >
                  <Icon name="arrow_back" size={18} />
                </button>
                <h2 style={{ ...t.sectionHeader, color: t.text }}>
                  Client Conversation
                </h2>
              </div>
              <MessageThread
                conversationId={activeConversationId}
                currentUserId={user?.uid || ""}
                currentUserRole="agent"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
