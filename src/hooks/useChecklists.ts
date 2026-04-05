import { useEffect, useState } from "react";
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, doc, setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { BUYER_CHECKLIST_ITEMS, SELLER_CHECKLIST_ITEMS } from "@/types";
import type { TransactionChecklist } from "@/types";
import { getMilestoneMapping } from "@/constants/milestoneMap";

function emptyItems(type: "buyer" | "seller"): Record<string, boolean> {
  const source = type === "buyer" ? BUYER_CHECKLIST_ITEMS : SELLER_CHECKLIST_ITEMS;
  const items: Record<string, boolean> = {};
  for (const k of source) items[k] = false;
  return items;
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

  async function createChecklist(clientId: string, type: "buyer" | "seller") {
    if (!user) return;
    const now = Date.now();
    await addDoc(collection(db, "checklists"), {
      userId: user.uid,
      clientId,
      type,
      items: emptyItems(type),
      createdAt: now,
      updatedAt: now,
    });
  }

  async function toggleItem(
    checklistId: string,
    checklist: TransactionChecklist,
    key: string,
    transactionId?: string,
  ) {
    const newValue = !checklist.items[key];
    const updated = { ...checklist.items, [key]: newValue };
    await updateDoc(doc(db, "checklists", checklistId), {
      items: updated,
      updatedAt: Date.now(),
    });

    // Sync to milestone subcollection if mapping exists and transactionId provided
    if (transactionId) {
      const mapping = getMilestoneMapping(checklist.type, key);
      if (mapping) {
        const notifyClient = checklist.notifications?.[key] ?? mapping.defaultNotifyClient;
        const milestoneRef = doc(db, "transactions", transactionId, "milestones", mapping.milestoneId);
        await setDoc(milestoneRef, {
          label: mapping.label,
          stage: mapping.stage,
          completed: newValue,
          completedAt: newValue ? Date.now() : null,
          completedBy: newValue ? user?.uid ?? null : null,
          clientVisible: mapping.defaultClientVisible,
          notifyClient: newValue ? notifyClient : false,
        }, { merge: true });
      }
    }
  }

  function getClientChecklist(clientId: string): TransactionChecklist | undefined {
    return checklists.find((c) => c.clientId === clientId);
  }

  return { checklists, loading, createChecklist, toggleItem, getClientChecklist };
}
