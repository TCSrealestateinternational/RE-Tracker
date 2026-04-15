import { Icon } from "@/components/shared/Icon";
import { t, card } from "@/styles/theme";
import type { Conversation } from "@/types";

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
  onSelect: (conversationId: string) => void;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(ts).toLocaleDateString();
}

export function ConversationList({ conversations, currentUserId, onSelect }: ConversationListProps) {
  return (
    <div style={{ display: "grid", gap: "8px" }} role="list" aria-label="Conversations">
      {conversations.map((conv) => {
        const isAgent = conv.agentId === currentUserId;
        const unread = isAgent ? conv.agentUnreadCount : conv.clientUnreadCount;
        return (
          <button
            key={conv.id}
            role="listitem"
            onClick={() => onSelect(conv.id)}
            style={{
              ...card,
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 16px",
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
              border: `1px solid ${t.border}`,
              fontFamily: t.font,
              transition: "background 0.12s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = t.surface; }}
          >
            {/* Avatar */}
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: t.primaryContainer,
              color: t.teal,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: 700,
              flexShrink: 0,
            }}>
              <Icon name={isAgent ? "person" : "support_agent"} size={18} />
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                <span style={{
                  ...t.body,
                  fontWeight: unread > 0 ? 600 : 400,
                  color: t.text,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {isAgent ? "Client" : "Your Agent"}
                </span>
                <span style={{ ...t.caption, color: t.textTertiary, flexShrink: 0 }}>
                  {conv.lastMessageAt ? timeAgo(conv.lastMessageAt) : ""}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{
                  ...t.caption,
                  color: unread > 0 ? t.text : t.textTertiary,
                  fontWeight: unread > 0 ? 500 : 400,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flex: 1,
                }}>
                  {conv.lastMessage || "No messages yet"}
                </span>
                {unread > 0 && (
                  <span
                    aria-label={`${unread} unread messages`}
                    style={{
                      minWidth: "20px",
                      height: "20px",
                      borderRadius: "100px",
                      background: t.teal,
                      color: t.textInverse,
                      fontSize: "11px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 6px",
                      flexShrink: 0,
                    }}
                  >
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
