import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Milestone } from "@/types";

export function useMilestones(transactionId: string | undefined) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!transactionId) {
      setMilestones([]);
      setLoading(false);
      return;
    }

    const colRef = collection(db, "transactions", transactionId, "milestones");
    const unsub = onSnapshot(
      colRef,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Milestone);
        setMilestones(data);
        setLoading(false);
      },
      (err) => {
        console.warn("Milestones subscription error:", err);
        setLoading(false);
      },
    );

    return unsub;
  }, [transactionId]);

  async function addMilestone(
    txId: string,
    milestone: Omit<Milestone, "id">,
  ) {
    const colRef = collection(db, "transactions", txId, "milestones");
    await addDoc(colRef, milestone);
  }

  async function updateMilestone(
    txId: string,
    milestoneId: string,
    data: Partial<Milestone>,
  ) {
    const ref = doc(db, "transactions", txId, "milestones", milestoneId);
    await updateDoc(ref, data);
  }

  async function removeMilestone(txId: string, milestoneId: string) {
    const ref = doc(db, "transactions", txId, "milestones", milestoneId);
    await deleteDoc(ref);
  }

  async function toggleComplete(
    txId: string,
    milestone: Milestone,
    userId: string,
  ) {
    const ref = doc(db, "transactions", txId, "milestones", milestone.id);
    if (milestone.completed) {
      await updateDoc(ref, {
        completed: false,
        completedAt: null,
        completedBy: null,
      });
    } else {
      await updateDoc(ref, {
        completed: true,
        completedAt: Date.now(),
        completedBy: userId,
      });
    }
  }

  return {
    milestones,
    loading,
    addMilestone,
    updateMilestone,
    removeMilestone,
    toggleComplete,
  };
}
