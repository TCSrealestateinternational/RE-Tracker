import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { Brokerage } from "@/types";

export function useBrokerage() {
  const { profile } = useAuth();
  const [brokerage, setBrokerage] = useState<Brokerage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.brokerageId) {
      setBrokerage(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const snap = await getDoc(doc(db, "brokerages", profile!.brokerageId));
        if (!cancelled && snap.exists()) {
          setBrokerage({ id: snap.id, ...snap.data() } as Brokerage);
        }
      } catch (err) {
        console.warn("Failed to load brokerage:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [profile?.brokerageId]);

  async function updateBrokerage(data: Partial<Omit<Brokerage, "id">>) {
    if (!profile?.brokerageId) return;
    await updateDoc(doc(db, "brokerages", profile.brokerageId), data);
    setBrokerage((prev) => prev ? { ...prev, ...data } : prev);
  }

  return { brokerage, loading, updateBrokerage };
}
