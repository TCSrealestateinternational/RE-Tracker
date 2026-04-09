import { useEffect, useState } from "react";
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, deleteField, doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { Client, ClientStage } from "@/types";

export function useClients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "clients"),
      where("userId", "==", user.uid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Client);
        docs.sort((a, b) => b.createdAt - a.createdAt);
        setClients(docs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore clients listener error:", err);
        setError(err.message);
        setLoading(false);
      }
    );
    return unsub;
  }, [user]);

  async function addClient(data: Omit<Client, "id" | "userId" | "createdAt" | "updatedAt">): Promise<string> {
    if (!user) throw new Error("Not signed in");
    const now = Date.now();
    const docRef = await addDoc(collection(db, "clients"), {
      ...data,
      userId: user.uid,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  async function updateClient(id: string, data: Partial<Client>) {
    await updateDoc(doc(db, "clients", id), {
      ...data,
      updatedAt: Date.now(),
    });
  }

  async function deleteClient(id: string) {
    await deleteDoc(doc(db, "clients", id));
  }

  async function archiveClient(id: string) {
    await updateDoc(doc(db, "clients", id), {
      stage: "archived",
      archivedAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  async function unarchiveClient(id: string, newStage: ClientStage = "closed") {
    await updateDoc(doc(db, "clients", id), {
      stage: newStage,
      archivedAt: deleteField(),
      updatedAt: Date.now(),
    });
  }

  return {
    clients, loading, error,
    addClient, updateClient, deleteClient,
    archiveClient, unarchiveClient,
  };
}
