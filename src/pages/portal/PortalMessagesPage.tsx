import { useState, useEffect, useRef } from "react";
import {
  collection, query, where, orderBy, onSnapshot, addDoc,
  limit, doc, updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { t, card, inputBase, btnPrimary } from "@/styles/theme";
import { Send, MessageSquare } from "lucide-react";
import type { Message, Conversation } from "@/types";

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function fmtDate(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function PortalMessagesPage() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [_conversation, setConversation] = useState<Conversation | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isAgent = profile?.role === "agent";

  // For agents, show a list of conversations; for clients, auto-load their conversation
  const [agentConvos, setAgentConvos] = useState<Conversation[]>([]);
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);

  // Load conversations
  useEffect(() => {
    if (!user) return;

    if (isAgent) {
      const q = query(
        collection(db, "conversations"),
        where("agentId", "==", user.uid),
        orderBy("lastMessageAt", "desc"),
      );
      const unsub = onSnapshot(q, (snap) => {
        const convos = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Conversation);
        setAgentConvos(convos);
        const first = convos[0];
        if (!selectedConvoId && first) setSelectedConvoId(first.id);
      });
      return unsub;
    } else {
      // Client: find their conversation
      const q = query(
        collection(db, "conversations"),
        where("clientUserId", "==", user.uid),
        limit(1),
      );
      const unsub = onSnapshot(q, (snap) => {
        const first = snap.docs[0];
        if (first) {
          const c = { id: first.id, ...first.data() } as Conversation;
          setConversation(c);
          setSelectedConvoId(c.id);
        }
      });
      return unsub;
    }
  }, [user, isAgent]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConvoId) return;
    const q = query(
      collection(db, "messages"),
      where("conversationId", "==", selectedConvoId),
      orderBy("createdAt", "asc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Message));
    });
    return unsub;
  }, [selectedConvoId]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMsg.trim() || !user || !selectedConvoId || sending) return;

    setSending(true);
    const text = newMsg.trim();
    setNewMsg("");

    try {
      // Ensure conversation exists for client first message
      let convoId = selectedConvoId;
      if (!convoId && !isAgent && profile?.agentId && profile?.clientId) {
        // Create conversation
        const convoRef = await addDoc(collection(db, "conversations"), {
          agentId: profile.agentId,
          clientId: profile.clientId,
          clientUserId: user.uid,
          clientName: profile.displayName || user.email || "",
          lastMessage: text,
          lastMessageAt: Date.now(),
          createdAt: Date.now(),
        });
        convoId = convoRef.id;
        setSelectedConvoId(convoId);
      }

      await addDoc(collection(db, "messages"), {
        conversationId: convoId,
        senderId: user.uid,
        senderRole: profile?.role || "client",
        text,
        createdAt: Date.now(),
      });

      // Update conversation lastMessage
      await updateDoc(doc(db, "conversations", convoId), {
        lastMessage: text,
        lastMessageAt: Date.now(),
      });
    } finally {
      setSending(false);
    }
  }

  // Render agent conversation list
  if (isAgent && agentConvos.length === 0) {
    return (
      <div style={{ ...card, textAlign: "center", padding: "60px 40px" }}>
        <MessageSquare size={36} color={t.textTertiary} style={{ marginBottom: "12px" }} />
        <h2 style={{ ...t.sectionHeader, color: t.text, marginBottom: "12px" }}>No Messages Yet</h2>
        <p style={{ ...t.body, color: t.textSecondary }}>
          Once you invite clients to the portal and they send a message, conversations will appear here.
        </p>
      </div>
    );
  }

  // Client with no conversation yet
  if (!isAgent && !selectedConvoId && profile?.agentId) {
    // Allow client to start a conversation
    return (
      <div>
        <h1 style={{ ...t.pageTitle, color: t.text, marginBottom: t.sectionGap }}>Messages</h1>
        <div style={{ ...card }}>
          <p style={{ ...t.body, color: t.textSecondary, marginBottom: "16px" }}>
            Send your first message to your agent.
          </p>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!newMsg.trim() || !user || !profile?.agentId || !profile?.clientId) return;
            setSending(true);
            try {
              const convoRef = await addDoc(collection(db, "conversations"), {
                agentId: profile.agentId,
                clientId: profile.clientId,
                clientUserId: user.uid,
                clientName: profile.displayName || user.email || "",
                lastMessage: newMsg.trim(),
                lastMessageAt: Date.now(),
                createdAt: Date.now(),
              });
              await addDoc(collection(db, "messages"), {
                conversationId: convoRef.id,
                senderId: user.uid,
                senderRole: "client",
                text: newMsg.trim(),
                createdAt: Date.now(),
              });
              setNewMsg("");
              setSelectedConvoId(convoRef.id);
            } finally {
              setSending(false);
            }
          }} style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="Type a message..."
              style={{ ...inputBase, flex: 1 }}
            />
            <button type="submit" disabled={sending} style={{ ...btnPrimary, display: "flex", alignItems: "center", gap: "6px" }}>
              <Send size={16} /> Send
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Group messages by date
  const groupedByDate: { date: string; msgs: Message[] }[] = [];
  messages.forEach((msg) => {
    const dateStr = fmtDate(msg.createdAt);
    const last = groupedByDate[groupedByDate.length - 1];
    if (last && last.date === dateStr) {
      last.msgs.push(msg);
    } else {
      groupedByDate.push({ date: dateStr, msgs: [msg] });
    }
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
      <h1 style={{ ...t.pageTitle, color: t.text, marginBottom: "16px" }}>Messages</h1>

      <div style={{ display: "flex", flex: 1, gap: "16px", minHeight: 0 }}>
        {/* Conversation list for agents */}
        {isAgent && (
          <div style={{ width: "240px", flexShrink: 0, overflowY: "auto" }}>
            {agentConvos.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedConvoId(c.id)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "12px 14px",
                  background: selectedConvoId === c.id ? t.sidebarActive : "transparent",
                  border: "none",
                  borderBottom: `1px solid ${t.border}`,
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: t.font,
                }}
              >
                <span style={{ ...t.body, fontWeight: 600, color: t.text, display: "block" }}>
                  {c.clientName}
                </span>
                <span style={{
                  ...t.caption,
                  color: t.textTertiary,
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {c.lastMessage}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Messages area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", ...card, padding: 0 }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
            {groupedByDate.map((group) => (
              <div key={group.date}>
                <div style={{
                  textAlign: "center",
                  margin: "16px 0",
                }}>
                  <span style={{
                    ...t.caption,
                    color: t.textTertiary,
                    background: t.bg,
                    padding: "4px 12px",
                    borderRadius: "12px",
                  }}>
                    {group.date}
                  </span>
                </div>
                {group.msgs.map((msg) => {
                  const isMe = msg.senderId === user?.uid;
                  return (
                    <div key={msg.id} style={{
                      display: "flex",
                      justifyContent: isMe ? "flex-end" : "flex-start",
                      marginBottom: "8px",
                    }}>
                      <div style={{
                        maxWidth: "70%",
                        padding: "10px 14px",
                        borderRadius: "16px",
                        borderBottomRightRadius: isMe ? "4px" : "16px",
                        borderBottomLeftRadius: isMe ? "16px" : "4px",
                        background: isMe ? t.teal : t.bg,
                        color: isMe ? t.textInverse : t.text,
                      }}>
                        <p style={{ ...t.body, margin: 0 }}>{msg.text}</p>
                        <span style={{
                          ...t.caption,
                          color: isMe ? "rgba(255,255,255,0.6)" : t.textTertiary,
                          display: "block",
                          textAlign: "right",
                          marginTop: "4px",
                          fontSize: "11px",
                        }}>
                          {fmtTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} style={{
            display: "flex",
            gap: "8px",
            padding: "12px 16px",
            borderTop: `1px solid ${t.border}`,
          }}>
            <input
              type="text"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="Type a message..."
              style={{ ...inputBase, flex: 1 }}
            />
            <button
              type="submit"
              disabled={sending || !newMsg.trim()}
              style={{
                ...btnPrimary,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                opacity: sending || !newMsg.trim() ? 0.5 : 1,
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
