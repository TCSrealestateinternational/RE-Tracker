import { useState, useRef, useCallback } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { ActivityCategory, LeadSource } from "@/types";

export function useTimer() {
  const { user } = useAuth();
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [category, setCategory] = useState<ActivityCategory>("Lead Gen");
  const [clientId, setClientId] = useState<string | null>(null);
  const [leadSource, setLeadSource] = useState<LeadSource | "">("");
  const [note, setNote] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(0);

  const start = useCallback(() => {
    if (running) return;
    startRef.current = Date.now();
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsed(Date.now() - startRef.current);
    }, 200);
  }, [running]);

  const stop = useCallback(async () => {
    if (!running || !user) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    const endTime = Date.now();
    const durationMs = endTime - startRef.current;

    await addDoc(collection(db, "timeEntries"), {
      userId: user.uid,
      category,
      clientId,
      leadSource,
      note,
      startTime: startRef.current,
      endTime,
      durationMs,
      manual: false,
      createdAt: serverTimestamp(),
    });

    setRunning(false);
    setElapsed(0);
    setNote("");
  }, [running, user, category, clientId, leadSource, note]);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setElapsed(0);
  }, []);

  return {
    running, elapsed, category, clientId, leadSource, note,
    setCategory, setClientId, setLeadSource, setNote,
    start, stop, reset,
  };
}
