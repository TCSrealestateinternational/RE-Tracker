import { useEffect, useState } from "react";
import {
  collection, query, where, onSnapshot, addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { DailyCheckIn } from "@/types";
import { todayStr } from "@/utils/dates";

export function useDailyCheckIns() {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "dailyCheckIns"),
      where("userId", "==", user.uid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as DailyCheckIn);
        docs.sort((a, b) => b.date.localeCompare(a.date));
        setCheckIns(docs);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore dailyCheckIns listener error:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, [user]);

  const todayCheckIn = checkIns.find((c) => c.date === todayStr()) ?? null;

  function getStreak(): number {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const found = checkIns.find((c) => c.date === dateStr && c.prospected);
      if (found) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }

  async function submitCheckIn(prospected: boolean, contactsMade: number) {
    if (!user) return;
    await addDoc(collection(db, "dailyCheckIns"), {
      userId: user.uid,
      date: todayStr(),
      prospected,
      contactsMade,
      createdAt: Date.now(),
    });
  }

  return { checkIns, todayCheckIn, loading, getStreak, submitCheckIn };
}
