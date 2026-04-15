import { useState, useRef, useCallback } from "react";
import { Icon } from "@/components/shared/Icon";
import { t } from "@/styles/theme";

interface MessageInputProps {
  onSend: (text: string) => Promise<void>;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled = false }: MessageInputProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || sending || disabled) return;

    setSending(true);
    try {
      await onSend(trimmed);
      setText("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } finally {
      setSending(false);
    }
  }, [text, sending, disabled, onSend]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    // Auto-grow
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "flex-end",
      gap: "8px",
      padding: "12px 0",
      borderTop: `1px solid ${t.border}`,
    }}>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={disabled || sending}
        rows={1}
        aria-label="Message input"
        style={{
          flex: 1,
          padding: "10px 14px",
          borderRadius: "20px",
          border: `1px solid ${t.borderMedium}`,
          fontSize: "14px",
          fontFamily: t.font,
          color: t.text,
          background: t.surfaceContainerLow,
          outline: "none",
          resize: "none",
          overflow: "hidden",
          lineHeight: "1.4",
          maxHeight: "120px",
          boxSizing: "border-box",
        }}
      />
      <button
        onClick={handleSend}
        disabled={!text.trim() || sending || disabled}
        aria-label="Send message"
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          border: "none",
          background: text.trim() && !sending ? t.teal : t.surfaceContainerHigh,
          color: text.trim() && !sending ? t.textInverse : t.textTertiary,
          cursor: text.trim() && !sending ? "pointer" : "default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "background 0.15s",
        }}
      >
        <Icon name="send" size={20} />
      </button>
    </div>
  );
}
