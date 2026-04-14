import { useEffect, useState } from "react";
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { Referral } from "@/types";

export function useReferrals() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "referrals"),
      where("userId", "==", user.uid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Referral);
        docs.sort((a, b) => b.createdAt - a.createdAt);
        setReferrals(docs);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore referrals listener error:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, [user]);

  async function addReferral(data: Omit<Referral, "id" | "userId" | "createdAt" | "updatedAt">) {
    if (!user) throw new Error("You must be signed in to add a referral.");
    const now = Date.now();
    const payload = {
      ...data,
      userId: user.uid,
      createdAt: now,
      updatedAt: now,
    };
    try {
      await addDoc(collection(db, "referrals"), payload);
    } catch (err) {
      console.error("addReferral failed:", { uid: user.uid, payload, err });
      throw err;
    }
  }

  async function updateReferral(id: string, data: Partial<Referral>) {
    await updateDoc(doc(db, "referrals", id), { ...data, updatedAt: Date.now() });
  }

  async function deleteReferral(id: string) {
    await deleteDoc(doc(db, "referrals", id));
  }

  return { referrals, loading, addReferral, updateReferral, deleteReferral };
}
