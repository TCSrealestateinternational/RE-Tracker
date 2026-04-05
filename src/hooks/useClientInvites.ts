import { useState, useEffect } from "react";
import {
  collection, query, where, onSnapshot, addDoc, orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { ClientInvite } from "@/types";

export function useClientInvites() {
  const { user, profile } = useAuth();
  const [invites, setInvites] = useState<ClientInvite[]>([]);

  useEffect(() => {
    if (!user || profile?.role !== "agent") return;
    const q = query(
      collection(db, "clientInvites"),
      where("agentId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setInvites(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ClientInvite));
    });
    return unsub;
  }, [user, profile?.role]);

  async function inviteClient(clientEmail: string, clientId: string) {
    if (!user) return;
    await addDoc(collection(db, "clientInvites"), {
      agentId: user.uid,
      agentName: profile?.displayName || user.email || "",
      clientEmail: clientEmail.toLowerCase().trim(),
      clientId,
      accepted: false,
      createdAt: Date.now(),
    });
  }

  return { invites, inviteClient };
}
