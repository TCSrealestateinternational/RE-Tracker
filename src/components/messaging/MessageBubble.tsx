import { t } from "@/styles/theme";
import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
}

function formatTime(ts: number | { seconds?: number }): string {
  const ms = typeof ts === "number" ? ts : (ts?.seconds ? ts.seconds * 1000 : 0);
  return new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function MessageBubble({ message, isMine }: MessageBubbleProps) {
  const senderLabel = isMine ? "You" : (message.senderName || (message.senderRole === "agent" ? "Agent" : "Client"));
  const timeStr = formatTime(message.createdAt);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isMine ? "flex-end" : "flex-start",
        marginBottom: "8px",
      }}
    >
      <div
        style={{
          maxWidth: "75%",
          padding: "10px 14px",
          borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          background: isMine ? t.primaryContainer : t.surfaceContainerHigh,
          color: t.text,
        }}
      >
        {/* Screen reader text */}
        <span className="sr-only">
          {isMine ? "You" : senderLabel} at {timeStr}:
        </span>
        <p style={{
          ...t.body,
          margin: 0,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}>
          {message.text}
        </p>
        <div style={{
          ...t.caption,
          fontSize: "10px",
          color: t.textTertiary,
          marginTop: "4px",
          textAlign: isMine ? "right" : "left",
        }}
          aria-hidden="true"
        >
          {timeStr}
        </div>
      </div>
    </div>
  );
}
