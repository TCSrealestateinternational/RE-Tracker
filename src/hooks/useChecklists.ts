import { useEffect, useState } from "react";
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { BUYER_CHECKLIST_ITEMS, SELLER_CHECKLIST_ITEMS } from "@/types";
import type { TransactionChecklist } from "@/types";

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

  async function toggleItem(checklistId: string, checklist: TransactionChecklist, key: string) {
    const updated = { ...checklist.items, [key]: !checklist.items[key] };
    await updateDoc(doc(db, "checklists", checklistId), {
      items: updated,
      updatedAt: Date.now(),
    });
  }

  function getClientChecklist(clientId: string): TransactionChecklist | undefined {
    return checklists.find((c) => c.clientId === clientId);
  }

  return { checklists, loading, createChecklist, toggleItem, getClientChecklist };
}
