import { useState } from "react";
import { useReferrals } from "@/hooks/useReferrals";
import { ReferralList } from "@/components/referrals/ReferralList";
import { ReferralForm } from "@/components/referrals/ReferralForm";
import { ReferralDetail } from "@/components/referrals/ReferralDetail";
import type { Referral } from "@/types";

type View = "list" | "add" | "detail" | "edit";

export function ReferralsPage() {
  const { referrals, addReferral, updateReferral, deleteReferral } = useReferrals();
  const [view, setView] = useState<View>("list");
  const [selected, setSelected] = useState<Referral | null>(null);

  if (view === "add") {
    return (
      <ReferralForm
        onSubmit={async (data) => {
          await addReferral(data);
          setView("list");
        }}
        onCancel={() => setView("list")}
      />
    );
  }

  if (view === "edit" && selected) {
    return (
      <ReferralForm
        initial={selected}
        onSubmit={async (data) => {
          await updateReferral(selected.id, data);
          setSelected({ ...selected, ...data } as Referral);
          setView("detail");
        }}
        onCancel={() => setView("detail")}
      />
    );
  }

  if (view === "detail" && selected) {
    return (
      <ReferralDetail
        referral={selected}
        onEdit={() => setView("edit")}
        onBack={() => { setSelected(null); setView("list"); }}
        onDelete={async (id) => {
          await deleteReferral(id);
          setSelected(null);
          setView("list");
        }}
      />
    );
  }

  return (
    <ReferralList
      referrals={referrals}
      onSelect={(r) => { setSelected(r); setView("detail"); }}
      onAdd={() => setView("add")}
    />
  );
}
