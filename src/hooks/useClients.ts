import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { Client } from "@/types";

export function useClients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "clients"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setClients(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Client));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  async function addClient(data: Omit<Client, "id" | "userId" | "createdAt" | "updatedAt">) {
    if (!user) return;
    const now = Date.now();
    await addDoc(collection(db, "clients"), {
      ...data,
      userId: user.uid,
      createdAt: now,
      updatedAt: now,
    });
  }

  async function updateClient(id: string, data: Partial<Client>) {
    await updateDoc(doc(db, "clients", id), {
      ...data,
      updatedAt: Date.now(),
    });
  }

  return { clients, loading, addClient, updateClient };
}
