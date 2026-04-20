import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { Message, Thread } from "@/types";

interface UseConversationsReturn {
  threads: Thread[];
  loading: boolean;
  totalUnread: number;
}

export function useConversations(): UseConversationsReturn {
  const { user, profile } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) {
      setLoading(false);
      return;
    }

    // Query all messages in this brokerage
    const q = query(
      collection(db, "messages"),
      where("brokerageId", "==", profile.brokerageId),
    );

    const unsub = onSnapshot(q, (snap) => {
      const allMessages = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Message),
      );

      // Group by threadId
      const threadMap = new Map<string, Message[]>();
      for (const msg of allMessages) {
        const existing = threadMap.get(msg.threadId) || [];
        existing.push(msg);
        threadMap.set(msg.threadId, existing);
      }

      // Build thread list
      const threadList: Thread[] = [];
      for (const [threadId, msgs] of threadMap) {
        // Sort by createdAt desc to find the latest
        const sorted = [...msgs].sort((a, b) => {
          const ta = typeof a.createdAt === "number" ? a.createdAt : 0;
          const tb = typeof b.createdAt === "number" ? b.createdAt : 0;
          return tb - ta;
        });
        const latest = sorted[0];
        if (!latest) continue;

        // Count unread: messages not sent by me and not read
        const unreadCount = msgs.filter(
          (m) => m.senderId !== user.uid && !m.readAt,
        ).length;

        // Derive client name from the most recent message with a non-agent sender
        const clientMsg = msgs.find((m) => m.senderRole === "client");
        const clientName = clientMsg?.senderName || "Client";

        const lastAt = typeof latest.createdAt === "number"
          ? latest.createdAt
          : (latest.createdAt as { seconds?: number })?.seconds
            ? (latest.createdAt as { seconds: number }).seconds * 1000
            : 0;

        threadList.push({
          id: threadId,
          clientName,
          lastMessage: latest.text?.slice(0, 100) || "",
          lastMessageAt: lastAt,
          unreadCount,
        });
      }

      // Sort by most recent
      threadList.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
      setThreads(threadList);
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    return unsub;
  }, [user, profile]);

  const totalUnread = threads.reduce((sum, t) => sum + t.unreadCount, 0);

  return { threads, loading, totalUnread };
}
