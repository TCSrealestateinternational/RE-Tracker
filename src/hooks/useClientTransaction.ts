import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { SharedTransaction, Milestone, TransactionChecklist } from "@/types";

interface ClientTransactionData {
  transaction: SharedTransaction | null;
  milestones: Milestone[];
  checklist: TransactionChecklist | null;
  loading: boolean;
}

export function useClientTransaction(): ClientTransactionData {
  const { user } = useAuth();
  const [transaction, setTransaction] = useState<SharedTransaction | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [checklist, setChecklist] = useState<TransactionChecklist | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the client's active transaction
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "transactions"),
      where("clientId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(1),
    );

    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) {
        setTransaction(null);
        setLoading(false);
        return;
      }
      const txDoc = snap.docs[0]!;
      setTransaction({ id: txDoc.id, ...txDoc.data() } as SharedTransaction);
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    return unsub;
  }, [user]);

  const transactionId = transaction?.id ?? null;
  const reTrackerClientId = transaction?.reTrackerClientId ?? null;

  // Fetch milestones when transaction is loaded
  useEffect(() => {
    if (!transactionId) {
      setMilestones([]);
      return;
    }

    const q = query(
      collection(db, "transactions", transactionId, "milestones"),
      orderBy("completedAt", "asc"),
    );

    return onSnapshot(q, (snap) => {
      setMilestones(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Milestone)));
    });
  }, [transactionId]);

  // Fetch checklist linked to this client
  useEffect(() => {
    if (!reTrackerClientId) {
      setChecklist(null);
      return;
    }

    const q = query(
      collection(db, "checklists"),
      where("clientId", "==", reTrackerClientId),
      limit(1),
    );

    return onSnapshot(q, (snap) => {
      if (snap.empty) {
        setChecklist(null);
        return;
      }
      const clDoc = snap.docs[0]!;
      setChecklist({ id: clDoc.id, ...clDoc.data() } as TransactionChecklist);
    });
  }, [reTrackerClientId]);

  return { transaction, milestones, checklist, loading };
}
