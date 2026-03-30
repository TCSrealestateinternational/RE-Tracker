import { useEffect, useState } from "react";
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { TransactionChecklist, ChecklistItemKey } from "@/types";

function emptyItems(): Record<ChecklistItemKey, boolean> {
  const items: Partial<Record<ChecklistItemKey, boolean>> = {};
  const keys: readonly ChecklistItemKey[] = [
    "Inspection Scheduled", "Inspection Complete",
    "Appraisal Ordered", "Appraisal Complete",
    "Financing Contingency Cleared", "Title Search Complete",
    "Walk-Through Complete", "Closing Scheduled", "Closed",
  ];
  for (const k of keys) items[k] = false;
  return items as Record<ChecklistItemKey, boolean>;
}

export function useChecklists() {
  const { user } = useAuth();
  const [checklists, setChecklists] = useState<TransactionChecklist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "checklists"),
      where("userId", "==", user.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      setChecklists(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TransactionChecklist));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  async function createChecklist(clientId: string, dealId: string) {
    if (!user) return;
    const now = Date.now();
    await addDoc(collection(db, "checklists"), {
      userId: user.uid,
      clientId,
      dealId,
      items: emptyItems(),
      createdAt: now,
      updatedAt: now,
    });
  }

  async function toggleItem(checklistId: string, checklist: TransactionChecklist, key: ChecklistItemKey) {
    const updated = { ...checklist.items, [key]: !checklist.items[key] };
    await updateDoc(doc(db, "checklists", checklistId), {
      items: updated,
      updatedAt: Date.now(),
    });
  }

  return { checklists, loading, createChecklist, toggleItem };
}
