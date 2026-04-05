import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import type { SharedUser } from "@/types";
import { PLAN_DEFAULTS } from "@/types";

interface AuthContextValue {
  user: User | null;
  profile: SharedUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEFAULT_BROKERAGE_ID = import.meta.env.VITE_DEFAULT_BROKERAGE_ID || "life-built-in-kentucky";

async function resolveProfile(u: User): Promise<SharedUser> {
  const profileRef = doc(db, "users", u.uid);
  const snap = await getDoc(profileRef);
  if (snap.exists()) return { id: snap.id, ...snap.data() } as SharedUser;

  // New user — create as agent with tracker_only subscription
  const defaults = PLAN_DEFAULTS.tracker_only;
  const newProfile: Omit<SharedUser, "id"> = {
    email: u.email || "",
    displayName: u.displayName || u.email?.split("@")[0] || "",
    phone: "",
    roles: ["agent"],
    status: "active",
    brokerageId: DEFAULT_BROKERAGE_ID,
    subscription: {
      plan: "tracker_only",
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
          console.warn("Profile resolution failed, defaulting to agent:", err);
          const defaults = PLAN_DEFAULTS.tracker_only;
          setProfile({
            id: u.uid,
            email: u.email || "",
            displayName: u.displayName || u.email?.split("@")[0] || "",
            phone: "",
            roles: ["agent"],
            status: "active",
            brokerageId: DEFAULT_BROKERAGE_ID,
            subscription: {
              plan: "tracker_only",
              status: "active",
              features: { ...defaults },
              trialEndsAt: null,
              billingCycleEnd: null,
            },
            createdAt: Date.now(),
            lastLoginAt: Date.now(),
          });
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

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
