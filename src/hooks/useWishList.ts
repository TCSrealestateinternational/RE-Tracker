import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { WishListItem, WishListPriority } from "@/types";

export function useWishList(transactionId: string) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const docRef = transactionId
    ? doc(db, "transactions", transactionId, "wishlist", "data")
    : null;

  useEffect(() => {
    if (!docRef) return;
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setItems((data.items as WishListItem[]) || []);
      } else {
        setItems([]);
      }
      setLoading(false);
    });
    return unsub;
  }, [transactionId]);

  async function saveItems(updated: WishListItem[]) {
    if (!docRef) return;
    await setDoc(docRef, { items: updated, updatedAt: Date.now() }, { merge: true });
  }

  async function addItem(text: string, priority: WishListPriority) {
    if (!user) return;
    const newItem: WishListItem = {
      id: crypto.randomUUID(),
      text,
      priority,
      sortOrder: items.length,
      createdAt: Date.now(),
    };
    await saveItems([...items, newItem]);
  }

  async function removeItem(itemId: string) {
    await saveItems(items.filter((i) => i.id !== itemId));
  }

  async function updateItem(itemId: string, patch: Partial<Pick<WishListItem, "text" | "priority">>) {
    await saveItems(items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)));
  }

  return { items, loading, addItem, removeItem, updateItem };
}
