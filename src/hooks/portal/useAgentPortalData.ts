import { useCallback } from "react";
import { collection, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { CostLineItem, MarketComp } from "@/types";

/** Agent-side write operations for portal data */
export function useAgentPortalData() {
  const { user } = useAuth();

  const addDecision = useCallback(async (clientId: string, data: {
    title: string;
    description: string;
    outcome: string;
    phase: string;
  }) => {
    if (!user) return;
    await addDoc(collection(db, "decisions"), {
      agentId: user.uid,
      clientId,
      ...data,
      clientNote: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }, [user]);

  const updateDecision = useCallback(async (decisionId: string, data: Partial<{
    title: string;
    description: string;
    outcome: string;
    phase: string;
  }>) => {
    await updateDoc(doc(db, "decisions", decisionId), {
      ...data,
      updatedAt: Date.now(),
    });
  }, []);

  const deleteDecision = useCallback(async (decisionId: string) => {
    await deleteDoc(doc(db, "decisions", decisionId));
  }, []);

  const saveCostBreakdown = useCallback(async (clientId: string, data: {
    type: "buyer" | "seller";
    purchasePrice: number;
    items: CostLineItem[];
  }, existingId?: string) => {
    if (!user) return;
    const payload = {
      agentId: user.uid,
      clientId,
      ...data,
      updatedAt: Date.now(),
    };
    if (existingId) {
      await updateDoc(doc(db, "costBreakdowns", existingId), payload);
    } else {
      await addDoc(collection(db, "costBreakdowns"), {
        ...payload,
        createdAt: Date.now(),
      });
    }
  }, [user]);

  const saveMarketData = useCallback(async (clientId: string, data: {
    avgDaysOnMarket: number;
    medianPrice: number;
    inventoryLevel: string;
    pricePerSqft: number;
    comps: MarketComp[];
    agentNotes: string;
  }, existingId?: string) => {
    if (!user) return;
    const payload = {
      agentId: user.uid,
      clientId,
      ...data,
      updatedAt: Date.now(),
    };
    if (existingId) {
      await updateDoc(doc(db, "marketData", existingId), payload);
    } else {
      await addDoc(collection(db, "marketData"), {
        ...payload,
      });
    }
  }, [user]);

  return {
    addDecision,
    updateDecision,
    deleteDecision,
    saveCostBreakdown,
    saveMarketData,
  };
}
