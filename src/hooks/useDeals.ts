import { useEffect, useState } from "react";
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { Deal, DealStage } from "@/types";
import { ensureProjectedCommission } from "@/utils/commission";

export function useDeals() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "deals"),
      where("userId", "==", user.uid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Deal);
        docs.sort((a, b) => b.createdAt - a.createdAt);
        setDeals(docs);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore deals listener error:", err);
        setLoading(false);
      }
    );
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
    const existing = deals.find((d) => d.id === id);
    const safePatch = existing ? ensureProjectedCommission(existing, data) : data;
    await updateDoc(doc(db, "deals", id), { ...safePatch, updatedAt: Date.now() });
  }

  async function moveDeal(id: string, stage: DealStage) {
    await updateDoc(doc(db, "deals", id), { stage, updatedAt: Date.now() });
  }

  async function removeDeal(id: string) {
    await deleteDoc(doc(db, "deals", id));
  }

  return { deals, loading, addDeal, updateDeal, moveDeal, removeDeal };
}
