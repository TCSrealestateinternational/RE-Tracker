import { collection, doc, setDoc, updateDoc, arrayUnion, deleteField } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { Deal, Client, SharedTransactionStatus, SyncPermissions, SyncPermissionKey, PermissionChangeEntry } from "@/types";

const DEAL_STAGE_TO_STATUS: Record<string, SharedTransactionStatus> = {
  "New Lead": "active",
  "Active": "active",
  "Under Contract": "under-contract",
  "Closed": "closed",
  "Lost": "withdrawn",
};

export function useTransactionSync() {
  const { user, profile } = useAuth();

  async function syncDealToTransaction(
    deal: Deal,
    client: Client,
  ): Promise<string> {
    if (!user || !profile) throw new Error("Not authenticated");

    const brokerageId = profile.brokerageId;
    const txId = deal.transactionId || doc(collection(db, "transactions")).id;
    const txRef = doc(db, "transactions", txId);
    const now = Date.now();

    const txData = {
      brokerageId,
      clientId: client.id,
      agentId: user.uid,
      type: client.status === "buyer" ? "buying" : "selling" as const,
      status: DEAL_STAGE_TO_STATUS[deal.stage] || "active",
      label: `${client.name} — ${client.status === "buyer" ? "Buyer" : "Seller"}`,
      hearthPortalActive: false,
      reTrackerDealId: deal.id,
      reTrackerClientId: client.id,
      updatedAt: now,
    };

    if (deal.transactionId) {
      await updateDoc(txRef, txData);
    } else {
      await setDoc(txRef, { ...txData, createdAt: now });
    }

    // Back-link the deal to this transaction if not already linked
    if (!deal.transactionId) {
      await updateDoc(doc(db, "deals", deal.id), {
        transactionId: txId,
        updatedAt: now,
      });
    }

    return txId;
  }

  async function activateHearthPortal(transactionId: string): Promise<void> {
    await updateDoc(doc(db, "transactions", transactionId), {
      hearthPortalActive: true,
      updatedAt: Date.now(),
    });
  }

  async function archiveTransaction(transactionId: string): Promise<void> {
    await updateDoc(doc(db, "transactions", transactionId), {
      archivedAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  async function updateSyncPermissions(
    txId: string,
    newPermissions: SyncPermissions,
    changedBy: string,
    changes: { field: SyncPermissionKey; oldValue: boolean; newValue: boolean }[],
  ): Promise<void> {
    const historyEntries: PermissionChangeEntry[] = changes.map((c) => ({
      action: "permission_updated" as const,
      timestamp: Date.now(),
      changedBy,
      field: c.field,
      oldValue: c.oldValue,
      newValue: c.newValue,
    }));

    await updateDoc(doc(db, "transactions", txId), {
      syncPermissions: newPermissions,
      permissionHistory: arrayUnion(...historyEntries),
      updatedAt: Date.now(),
    });
  }

  async function pauseSync(txId: string, agentId: string): Promise<void> {
    const entry: PermissionChangeEntry = {
      action: "sync_paused",
      timestamp: Date.now(),
      changedBy: agentId,
    };
    await updateDoc(doc(db, "transactions", txId), {
      syncPausedAt: Date.now(),
      permissionHistory: arrayUnion(entry),
      updatedAt: Date.now(),
    });
  }

  async function resumeSync(txId: string, agentId: string): Promise<void> {
    const entry: PermissionChangeEntry = {
      action: "sync_resumed",
      timestamp: Date.now(),
      changedBy: agentId,
    };
    await updateDoc(doc(db, "transactions", txId), {
      syncPausedAt: deleteField(),
      permissionHistory: arrayUnion(entry),
      updatedAt: Date.now(),
    });
  }

  return {
    syncDealToTransaction,
    activateHearthPortal,
    archiveTransaction,
    updateSyncPermissions,
    pauseSync,
    resumeSync,
  };
}
