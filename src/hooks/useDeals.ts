import { useEffect, useState } from "react";
import {
  collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { Deal, DealStage } from "@/types";

export function useDeals() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "deals"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setDeals(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Deal));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  async function addDeal(data: Omit<Deal, "id" | "userId" | "createdAt" | "updatedAt">) {
    if (!user) return;
    const now = Date.now();
    await addDoc(collection(db, "deals"), {
      ...data,
      userId: user.uid,
      createdAt: now,
      updatedAt: now,
    });
  }

  async function updateDeal(id: string, data: Partial<Deal>) {
    await updateDoc(doc(db, "deals", id), { ...data, updatedAt: Date.now() });
  }

  async function moveDeal(id: string, stage: DealStage) {
    await updateDoc(doc(db, "deals", id), { stage, updatedAt: Date.now() });
  }

  async function removeDeal(id: string) {
    await deleteDoc(doc(db, "deals", id));
  }

  return { deals, loading, addDeal, updateDeal, moveDeal, removeDeal };
}
