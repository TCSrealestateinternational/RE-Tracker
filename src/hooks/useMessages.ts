import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { Message } from "@/types";

interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  sendMessage: (text: string) => Promise<void>;
  markRead: () => Promise<void>;
}

export function useMessages(threadId: string | null): UseMessagesReturn {
  const { user, profile, isAgent } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!threadId || !profile) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "messages"),
      where("brokerageId", "==", profile.brokerageId),
      where("threadId", "==", threadId),
      orderBy("createdAt", "asc"),
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)),
      );
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    return unsub;
  }, [threadId, profile]);

  const sendMessage = useCallback(async (text: string) => {
    if (!threadId || !user || !profile || !text.trim()) return;

    await addDoc(collection(db, "messages"), {
      brokerageId: profile.brokerageId,
      threadId,
      senderId: user.uid,
      senderName: profile.displayName || profile.email || "Unknown",
      senderRole: isAgent ? "agent" : "client",
      text: text.trim(),
      createdAt: serverTimestamp(),
    });
  }, [threadId, user, profile, isAgent]);

  const markRead = useCallback(async () => {
    if (!threadId || !user) return;

    // Mark all unread messages in this thread that weren't sent by current user
    const unread = messages.filter(
      (m) => m.senderId !== user.uid && !m.readAt,
    );
    await Promise.all(
      unread.map((m) =>
        updateDoc(doc(db, "messages", m.id), { readAt: serverTimestamp() }),
      ),
    );
  }, [threadId, user, messages]);

  return { messages, loading, sendMessage, markRead };
}
