import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  setDoc,
  increment,
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

export function useMessages(conversationId: string | null): UseMessagesReturn {
  const { user, profile, isAgent } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "conversations", conversationId, "messages"),
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
  }, [conversationId]);

  const sendMessage = useCallback(async (text: string) => {
    if (!conversationId || !user || !profile || !text.trim()) return;

    const senderRole = isAgent ? "agent" : (profile.roles?.[0] || "buyer") as "agent" | "buyer" | "seller";

    // Add message to subcollection
    await addDoc(collection(db, "conversations", conversationId, "messages"), {
      conversationId,
      senderId: user.uid,
      senderRole,
      text: text.trim(),
      createdAt: Date.now(),
    });

    // Update conversation metadata
    const unreadField = isAgent ? "clientUnreadCount" : "agentUnreadCount";
    await updateDoc(doc(db, "conversations", conversationId), {
      lastMessage: text.trim().slice(0, 100),
      lastMessageAt: Date.now(),
      [unreadField]: increment(1),
    });
  }, [conversationId, user, profile, isAgent]);

  const markRead = useCallback(async () => {
    if (!conversationId || !user) return;

    const unreadField = isAgent ? "agentUnreadCount" : "clientUnreadCount";
    await updateDoc(doc(db, "conversations", conversationId), {
      [unreadField]: 0,
    });
  }, [conversationId, user, isAgent]);

  return { messages, loading, sendMessage, markRead };
}

// Create a new conversation between agent and client
export async function createConversation(
  agentId: string,
  clientUserId: string,
  brokerageId: string,
): Promise<string> {
  const convRef = doc(collection(db, "conversations"));
  await setDoc(convRef, {
    agentId,
    clientUserId,
    brokerageId,
    lastMessage: "",
    lastMessageAt: Date.now(),
    agentUnreadCount: 0,
    clientUnreadCount: 0,
    createdAt: Date.now(),
  });
  return convRef.id;
}
