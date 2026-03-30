import { useEffect, useState } from "react";
import {
  collection, query, where, onSnapshot, addDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { TimeEntry, ActivityCategory, LeadSource } from "@/types";

export function useTimeEntries() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "timeEntries"),
      where("userId", "==", user.uid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TimeEntry);
        docs.sort((a, b) => b.startTime - a.startTime);
        setEntries(docs);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore timeEntries listener error:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, [user]);

  async function addManualEntry(data: {
    category: ActivityCategory;
    clientId: string | null;
    leadSource: LeadSource | "";
    note: string;
    startTime: number;
    endTime: number;
  }) {
    if (!user) return;
    await addDoc(collection(db, "timeEntries"), {
      userId: user.uid,
      ...data,
      durationMs: data.endTime - data.startTime,
      manual: true,
      createdAt: serverTimestamp(),
    });
  }

  return { entries, loading, addManualEntry };
}
