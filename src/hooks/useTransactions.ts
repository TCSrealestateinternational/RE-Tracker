import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { SharedTransaction } from "@/types";

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<SharedTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "transactions"),
      where("agentId", "==", user.uid),
    );
    const unsub = onSnapshot(q, (snap) => {
      setTransactions(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SharedTransaction),
      );
      setLoading(false);
    });
    return unsub;
  }, [user]);

  function getTransactionForClient(clientId: string): SharedTransaction | undefined {
    return transactions.find(
      (tx) => tx.reTrackerClientId === clientId || tx.clientId === clientId,
    );
  }

  return { transactions, loading, getTransactionForClient };
}
