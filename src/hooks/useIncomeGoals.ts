import { useEffect, useState } from "react";
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, doc, limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { IncomeGoal } from "@/types";

export function useIncomeGoals() {
  const { user } = useAuth();
  const [goal, setGoal] = useState<IncomeGoal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "incomeGoals"),
      where("userId", "==", user.uid),
      limit(1)
    );
    const unsub = onSnapshot(q, (snap) => {
      if (snap.docs.length > 0) {
        setGoal({ id: snap.docs[0]!.id, ...snap.docs[0]!.data() } as IncomeGoal);
      } else {
        setGoal(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [user]);

  async function saveGoal(annualTarget: number, avgCommissionPerDeal: number) {
    if (!user) return;
    const now = Date.now();
    if (goal) {
      await updateDoc(doc(db, "incomeGoals", goal.id), {
        annualTarget,
        avgCommissionPerDeal,
        updatedAt: now,
      });
    } else {
      await addDoc(collection(db, "incomeGoals"), {
        userId: user.uid,
        annualTarget,
        avgCommissionPerDeal,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return { goal, loading, saveGoal };
}
