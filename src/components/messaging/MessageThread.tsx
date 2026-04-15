import { useEffect, useRef } from "react";
import { useMessages } from "@/hooks/useMessages";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { t } from "@/styles/theme";

interface MessageThreadProps {
  conversationId: string;
  currentUserId: string;
  currentUserRole: string;
}

export function MessageThread({ conversationId, currentUserId }: MessageThreadProps) {
  const { messages, loading, sendMessage, markRead } = useMessages(conversationId);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Mark messages as read when viewing
  useEffect(() => {
    markRead();
  }, [conversationId, messages.length, markRead]);

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ ...t.body, color: t.textTertiary }}>Loading messages...</p>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      minHeight: 0,
    }}>
      {/* Messages area */}
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label="Message history"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.length === 0 && (
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "32px",
          }}>
            <p style={{ ...t.body, color: t.textTertiary }}>
              No messages yet. Send a message to start the conversation.
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isMine={msg.senderId === currentUserId}
          />
        ))}
      </div>

      {/* Input */}
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
