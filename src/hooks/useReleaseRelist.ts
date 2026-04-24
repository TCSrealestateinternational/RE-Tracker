import {
  collection, doc, setDoc, updateDoc, addDoc, getDoc, getDocs, query, where, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { getDefaultPermissions } from "@/constants/permissionDefaults";
import { SELLER_CHECKLIST_TEMPLATE } from "@/constants/checklist-seller";
import type { Deal, Client, TransactionChecklist } from "@/types";

// Seller stages that get reset when going back on market (Phase 4+)
const SELLER_RESET_STAGES = new Set([
  "Offer Received",
  "Under Contract",
  "Inspection",
  "Appraisal",
  "Financing / Clear to Close",
  "Closing Prep",
  "Closing Day",
]);

// Hearth uses "Phase X — Name" format
const HEARTH_SELLER_RESET_STAGES = new Set([
  "Phase 4 — Offer Received",
  "Phase 5 — Under Contract",
  "Phase 6 — Inspection",
  "Phase 7 — Appraisal",
  "Phase 8 — Financing / Clear to Close",
  "Phase 9 — Closing Prep",
  "Phase 10 — Closing Day",
]);

export function useReleaseRelist() {
  const { user, profile } = useAuth();

  /**
   * Release a buyer's deal: archive old transaction, create a fresh one.
   */
  async function releaseBuyerDeal(
    deal: Deal,
    client: Client,
    reason: string,
  ): Promise<{ newDealId: string; newTxId: string }> {
    if (!user || !profile) throw new Error("Not authenticated");

    const now = Date.now();
    const brokerageId = profile.brokerageId;
    const oldTxId = deal.transactionId;

    // 1. Move old deal to "Released"
    await updateDoc(doc(db, "deals", deal.id), {
      stage: "Released",
      updatedAt: now,
    });

    // 2. Archive the old transaction
    if (oldTxId) {
      await updateDoc(doc(db, "transactions", oldTxId), {
        status: "withdrawn",
        archivedAt: now,
        releaseReason: reason,
        releasedAt: now,
        updatedAt: serverTimestamp(),
      });
    }

    // 3. Create new deal
    const newDealRef = await addDoc(collection(db, "deals"), {
      userId: user.uid,
      clientId: deal.clientId,
      clientName: deal.clientName,
      stage: "Active",
      purchasePrice: 0,
      commissionPercent: deal.commissionPercent,
      projectedCommission: 0,
      actualCommission: null,
      expectedCloseDate: "",
      actualCloseDate: null,
      leadSource: deal.leadSource,
      notes: "",
      createdAt: now,
      updatedAt: now,
    });
    const newDealId = newDealRef.id;

    // 4. Create new transaction
    const newTxId = doc(collection(db, "transactions")).id;
    await setDoc(doc(db, "transactions", newTxId), {
      brokerageId,
      clientId: client.hearthUserId || client.id,
      agentId: user.uid,
      type: "buying" as const,
      status: "active",
      label: `${client.name} — Buyer`,
      hearthPortalActive: true,
      reTrackerDealId: newDealId,
      reTrackerClientId: client.id,
      syncPermissions: getDefaultPermissions("buyer"),
      previousTransactionId: oldTxId || null,
      permissionHistory: [{
        action: "invite_sent" as const,
        timestamp: now,
        changedBy: user.uid,
      }],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // 5. Back-link new deal to new transaction
    await updateDoc(doc(db, "deals", newDealId), { transactionId: newTxId });

    // 6. Create fresh RE Tracker checklist
    const { BUYER_CHECKLIST_ITEMS } = await import("@/types");
    const emptyItems: Record<string, boolean> = {};
    for (const k of BUYER_CHECKLIST_ITEMS) emptyItems[k] = false;
    await addDoc(collection(db, "checklists"), {
      userId: user.uid,
      clientId: client.id,
      type: "buyer",
      items: emptyItems,
      createdAt: now,
      updatedAt: now,
    });

    // 7. Create fresh Hearth checklist
    const { BUYER_CHECKLIST_TEMPLATE } = await import("@/constants/checklist-buyer");
    const freshHearthItems = BUYER_CHECKLIST_TEMPLATE.map((t: { id: string; label: string; stage: string }) => ({
      id: t.id,
      label: t.label,
      stage: t.stage,
      completed: false,
    }));
    await setDoc(doc(db, "checklists", newTxId), {
      transactionId: newTxId,
      items: freshHearthItems,
      updatedAt: serverTimestamp(),
    });

    // 8. Reset client record
    await updateDoc(doc(db, "clients", client.id), {
      stage: "active",
      dateUnderContract: null,
      projectedCloseDate: null,
      updatedAt: now,
    });

    return { newDealId, newTxId };
  }

  /**
   * Relist a seller's deal: revert to active, partially reset checklists.
   */
  async function relistSellerDeal(
    deal: Deal,
    client: Client,
    checklist: TransactionChecklist | undefined,
    reason: string,
  ): Promise<void> {
    if (!user) throw new Error("Not authenticated");

    const now = Date.now();
    const txId = deal.transactionId;

    // 1. Move deal back to "Active"
    await updateDoc(doc(db, "deals", deal.id), {
      stage: "Active",
      updatedAt: now,
    });

    // 2. Revert transaction status
    if (txId) {
      const txRef = doc(db, "transactions", txId);
      const txSnap = await getDoc(txRef);
      const currentRelistCount = txSnap.exists() ? (txSnap.data().relistCount ?? 0) : 0;
      await updateDoc(txRef, {
        status: "active",
        releaseReason: reason,
        releasedAt: now,
        relistCount: currentRelistCount + 1,
        updatedAt: serverTimestamp(),
      });
    }

    // 3. Reset client record
    await updateDoc(doc(db, "clients", client.id), {
      stage: "active",
      acceptedOfferDate: null,
      expectedCloseDate: null,
      updatedAt: now,
    });

    // 4. Partially reset RE Tracker checklist (Phase 4+ unchecked)
    if (checklist) {
      const resetItems = { ...checklist.items };
      const resetMeta = { ...(checklist.itemMeta ?? {}) };
      for (const tmpl of SELLER_CHECKLIST_TEMPLATE) {
        if (SELLER_RESET_STAGES.has(tmpl.stage)) {
          resetItems[tmpl.label] = false;
          delete resetMeta[tmpl.label];
        }
      }
      await updateDoc(doc(db, "checklists", checklist.id), {
        items: resetItems,
        itemMeta: resetMeta,
        updatedAt: now,
      });
    }

    // 5. Partially reset Hearth checklist (Phase 4+ unchecked)
    if (txId) {
      try {
        const hearthChecklistRef = doc(db, "checklists", txId);
        const hearthSnap = await getDoc(hearthChecklistRef);
        if (hearthSnap.exists()) {
          const data = hearthSnap.data();
          if (Array.isArray(data.items)) {
            const resetHearthItems = data.items.map((item: Record<string, unknown>) => {
              const stage = item.stage as string;
              if (HEARTH_SELLER_RESET_STAGES.has(stage)) {
                return {
                  ...item,
                  completed: false,
                  completedAt: null,
                  completedBy: null,
                  completedByName: null,
                };
              }
              return item;
            });
            await updateDoc(hearthChecklistRef, {
              items: resetHearthItems,
              updatedAt: serverTimestamp(),
            });
          }
        }
      } catch (err) {
        console.warn("Failed to reset Hearth seller checklist:", err);
      }
    }

    // 6. Mark accepted offers as withdrawn
    if (txId) {
      try {
        const offersQ = query(
          collection(db, "offers"),
          where("transactionId", "==", txId),
          where("status", "==", "accepted"),
        );
        const offersSnap = await getDocs(offersQ);
        await Promise.all(
          offersSnap.docs.map((d) =>
            updateDoc(d.ref, { status: "withdrawn", updatedAt: serverTimestamp() })
          ),
        );
      } catch (err) {
        console.warn("Failed to update offers:", err);
      }
    }
  }

  return { releaseBuyerDeal, relistSellerDeal };
}
