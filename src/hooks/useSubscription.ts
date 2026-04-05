import { useAuth } from "@/context/AuthContext";

export function useSubscription() {
  const { profile } = useAuth();
  const sub = profile?.subscription;

  return {
    plan: sub?.plan ?? null,
    isActive: sub?.status === "active" || sub?.status === "trialing",
    hasReTracker: sub?.features.reTracker ?? false,
    hasHearthPortal: sub?.features.hearthPortal ?? false,
    hasWhiteLabel: sub?.features.whiteLabel ?? false,
    maxClients: sub?.features.maxClients ?? 0,
  };
}
