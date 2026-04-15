import { useEffect, useState } from "react";
import {
  collection, onSnapshot, addDoc, updateDoc, doc, query, orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { TrackedOffer, TrackedOfferStatus, OfferTimelineEvent } from "@/types";

export function useOffers(transactionId: string) {
  const { user } = useAuth();
  const [offers, setOffers] = useState<TrackedOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!transactionId) return;
    const q = query(
      collection(db, "transactions", transactionId, "offers"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setOffers(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TrackedOffer));
      setLoading(false);
    });
    return unsub;
  }, [transactionId]);

  async function addOffer(data: {
    propertyAddress: string;
    offerAmount: number;
    notes: string;
  }) {
    if (!user || !transactionId) return;
    const now = Date.now();
    const timeline: OfferTimelineEvent[] = [{ status: "draft", timestamp: now }];
    await addDoc(collection(db, "transactions", transactionId, "offers"), {
      transactionId,
      propertyAddress: data.propertyAddress,
      offerAmount: data.offerAmount,
      status: "draft",
      submittedAt: null,
      respondedAt: null,
      notes: data.notes,
      timeline,
      createdAt: now,
      updatedAt: now,
    });
  }

  async function updateOfferStatus(
    offerId: string,
    currentOffer: TrackedOffer,
    newStatus: TrackedOfferStatus,
    note?: string,
    counterAmount?: number,
  ) {
    const now = Date.now();
    const event: OfferTimelineEvent = { status: newStatus, timestamp: now, note };
    const timeline = [...(currentOffer.timeline || []), event];

    const update: Record<string, unknown> = {
      status: newStatus,
      timeline,
      updatedAt: now,
    };

    if (newStatus === "submitted") update.submittedAt = now;
    if (["accepted", "rejected", "countered", "expired"].includes(newStatus)) update.respondedAt = now;
    if (counterAmount !== undefined) update.counterAmount = counterAmount;

    await updateDoc(doc(db, "transactions", transactionId, "offers", offerId), update);
  }

  return { offers, loading, addOffer, updateOfferStatus };
}
