import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import type { SharedUser } from "@/types";
import { PLAN_DEFAULTS } from "@/types";

interface AuthContextValue {
  user: User | null;
  profile: SharedUser | null;
  loading: boolean;
  isAgent: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Pick<SharedUser, "displayName" | "phone" | "dashboardWidgets">>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEFAULT_BROKERAGE_ID = import.meta.env.VITE_DEFAULT_BROKERAGE_ID || "life-built-in-kentucky";

async function resolveProfile(u: User): Promise<SharedUser> {
  const profileRef = doc(db, "users", u.uid);
  const snap = await getDoc(profileRef);

  if (snap.exists()) {
    const data = snap.data() as Omit<SharedUser, "id">;

    // Migrate agents still on tracker_only to full_platform
    if (
      data.roles?.includes("agent") &&
      data.subscription?.plan === "tracker_only"
    ) {
      const upgraded = {
        ...data.subscription,
        plan: "full_platform" as const,
        features: { ...PLAN_DEFAULTS.full_platform },
      };
      await setDoc(profileRef, { subscription: upgraded }, { merge: true });
      return { id: snap.id, ...data, subscription: upgraded };
    }

    // Ensure client users have a subscription object (they may have been
    // created via AddToHearthModal without one)
    const isClientUser = data.roles?.some((r: string) => r === "buyer" || r === "seller" || r === "dual");
    if (isClientUser && !data.subscription) {
      const clientSub = {
        plan: "hearth_only" as const,
        status: "active" as const,
        features: { ...PLAN_DEFAULTS.hearth_only },
        trialEndsAt: null,
        billingCycleEnd: null,
      };
      await setDoc(profileRef, { subscription: clientSub, status: "active" }, { merge: true });
      return { id: snap.id, ...data, subscription: clientSub, status: "active" } as SharedUser;
    }

    return { id: snap.id, ...data } as SharedUser;
  }

  // New user — create as agent with full_platform subscription
  const defaults = PLAN_DEFAULTS.full_platform;
  const newProfile: Omit<SharedUser, "id"> = {
    email: u.email || "",
    displayName: u.displayName || u.email?.split("@")[0] || "",
    phone: "",
    roles: ["agent"],
    status: "active",
    brokerageId: DEFAULT_BROKERAGE_ID,
    subscription: {
      plan: "full_platform",
      status: "active",
      features: { ...defaults },
      trialEndsAt: null,
      billingCycleEnd: null,
    },
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
  };

  await setDoc(profileRef, newProfile);
  return { id: u.uid, ...newProfile };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<SharedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const p = await resolveProfile(u);
          setProfile(p);
        } catch (err) {
          console.warn("Profile resolution failed — attempting raw read:", err);
          // Try a direct read to at least get the roles right
          try {
            const fallbackSnap = await getDoc(doc(db, "users", u.uid));
            if (fallbackSnap.exists()) {
              const data = fallbackSnap.data();
              setProfile({
                id: u.uid,
                email: data.email || u.email || "",
                displayName: data.displayName || u.displayName || "",
                phone: data.phone || "",
                roles: data.roles || ["agent"],
                status: data.status || "active",
                brokerageId: data.brokerageId || DEFAULT_BROKERAGE_ID,
                subscription: data.subscription || {
                  plan: "hearth_only",
                  status: "active",
                  features: { ...PLAN_DEFAULTS.hearth_only },
                  trialEndsAt: null,
                  billingCycleEnd: null,
                },
                createdAt: data.createdAt || Date.now(),
                lastLoginAt: Date.now(),
              } as SharedUser);
            } else {
              // No doc at all — genuinely new user, default to agent
              const defaults = PLAN_DEFAULTS.full_platform;
              setProfile({
                id: u.uid,
                email: u.email || "",
                displayName: u.displayName || u.email?.split("@")[0] || "",
                phone: "",
                roles: ["agent"],
                status: "active",
                brokerageId: DEFAULT_BROKERAGE_ID,
                subscription: {
                  plan: "full_platform",
                  status: "active",
                  features: { ...defaults },
                  trialEndsAt: null,
                  billingCycleEnd: null,
                },
                createdAt: Date.now(),
                lastLoginAt: Date.now(),
              });
            }
          } catch {
            // Total fallback — can't read Firestore at all
            console.error("Cannot read user profile from Firestore");
            setProfile({
              id: u.uid,
              email: u.email || "",
              displayName: u.displayName || u.email?.split("@")[0] || "",
              phone: "",
              roles: ["agent"],
              status: "active",
              brokerageId: DEFAULT_BROKERAGE_ID,
              subscription: {
                plan: "full_platform",
                status: "active",
                features: { ...PLAN_DEFAULTS.full_platform },
                trialEndsAt: null,
                billingCycleEnd: null,
              },
              createdAt: Date.now(),
              lastLoginAt: Date.now(),
            });
          }
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signUp(email: string, password: string) {
    await createUserWithEmailAndPassword(auth, email, password);
  }

  async function signInWithGoogle() {
    await signInWithPopup(auth, googleProvider);
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  async function updateProfile(data: Partial<Pick<SharedUser, "displayName" | "phone" | "dashboardWidgets">>) {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), { ...data });
    setProfile((prev) => prev ? { ...prev, ...data } : prev);
  }

  const isAgent = profile?.roles?.includes("agent") ?? false;

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAgent, signIn, signUp, signInWithGoogle, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
