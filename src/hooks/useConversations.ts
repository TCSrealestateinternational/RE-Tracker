import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { Conversation } from "@/types";

interface UseConversationsReturn {
  conversations: Conversation[];
  loading: boolean;
  totalUnread: number;
}

export function useConversations(): UseConversationsReturn {
  const { user, isAgent } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const field = isAgent ? "agentId" : "clientUserId";
    const q = query(
      collection(db, "conversations"),
      where(field, "==", user.uid),
      orderBy("lastMessageAt", "desc"),
    );

    const unsub = onSnapshot(q, (snap) => {
      setConversations(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation)),
      );
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    return unsub;
  }, [user, isAgent]);

  const totalUnread = conversations.reduce((sum, c) => {
    return sum + (isAgent ? c.agentUnreadCount : c.clientUnreadCount);
  }, 0);

  return { conversations, loading, totalUnread };
}
