import { useState, useEffect } from "react";
import {
  collection, query, where, onSnapshot, orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type {
  Client, Deal, TransactionChecklist,
  Decision, CostBreakdown, MarketData,
} from "@/types";

/** Loads the client's own transaction data from their linked agent's records */
export function usePortalData() {
  const { profile } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [checklist, setChecklist] = useState<TransactionChecklist | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  const agentId = profile?.agentId;
  const clientId = profile?.clientId;

  // Load client record
  useEffect(() => {
    if (!agentId || !clientId) { setLoading(false); return; }
    const q = query(
      collection(db, "clients"),
      where("userId", "==", agentId),
    );
    const unsub = onSnapshot(q, (snap) => {
      const found = snap.docs.find((d) => d.id === clientId);
      setClient(found ? { id: found.id, ...found.data() } as Client : null);
      setLoading(false);
    });
    return unsub;
  }, [agentId, clientId]);

  // Load deal
  useEffect(() => {
    if (!agentId || !clientId) return;
    const q = query(
      collection(db, "deals"),
      where("userId", "==", agentId),
      where("clientId", "==", clientId),
    );
    const unsub = onSnapshot(q, (snap) => {
      const first = snap.docs[0];
      setDeal(first ? { id: first.id, ...first.data() } as Deal : null);
    });
    return unsub;
  }, [agentId, clientId]);

  // Load checklist
  useEffect(() => {
    if (!agentId || !clientId) return;
    const q = query(
      collection(db, "checklists"),
      where("userId", "==", agentId),
      where("clientId", "==", clientId),
    );
    const unsub = onSnapshot(q, (snap) => {
      const first = snap.docs[0];
      setChecklist(first ? { id: first.id, ...first.data() } as TransactionChecklist : null);
    });
    return unsub;
  }, [agentId, clientId]);

  // Load decisions
  useEffect(() => {
    if (!agentId || !clientId) return;
    const q = query(
      collection(db, "decisions"),
      where("agentId", "==", agentId),
      where("clientId", "==", clientId),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setDecisions(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Decision));
    });
    return unsub;
  }, [agentId, clientId]);

  // Load cost breakdown
  useEffect(() => {
    if (!agentId || !clientId) return;
    const q = query(
      collection(db, "costBreakdowns"),
      where("agentId", "==", agentId),
      where("clientId", "==", clientId),
    );
    const unsub = onSnapshot(q, (snap) => {
      const first = snap.docs[0];
      setCostBreakdown(first ? { id: first.id, ...first.data() } as CostBreakdown : null);
    });
    return unsub;
  }, [agentId, clientId]);

  // Load market data
  useEffect(() => {
    if (!agentId || !clientId) return;
    const q = query(
      collection(db, "marketData"),
      where("agentId", "==", agentId),
      where("clientId", "==", clientId),
    );
    const unsub = onSnapshot(q, (snap) => {
      const first = snap.docs[0];
      setMarketData(first ? { id: first.id, ...first.data() } as MarketData : null);
    });
    return unsub;
  }, [agentId, clientId]);

  return { client, deal, checklist, decisions, costBreakdown, marketData, loading };
}
