import { useEffect, useState } from "react";
import {
  collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp,
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
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TimeEntry));
      setLoading(false);
    });
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
