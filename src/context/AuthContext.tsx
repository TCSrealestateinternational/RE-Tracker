import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import type { UserProfile, UserRole } from "@/types";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function resolveProfile(u: User): Promise<UserProfile> {
  const profileRef = doc(db, "userProfiles", u.uid);
  const snap = await getDoc(profileRef);
  if (snap.exists()) return { id: snap.id, ...snap.data() } as UserProfile;

  // Check if there's a pending invite for this email
  const inviteQ = query(
    collection(db, "clientInvites"),
    where("clientEmail", "==", u.email),
    where("accepted", "==", false),
  );
  const inviteSnap = await getDocs(inviteQ);

  let role: UserRole = "agent";
  let agentId: string | undefined;
  let clientId: string | undefined;

  if (!inviteSnap.empty) {
    const inviteDoc = inviteSnap.docs[0];
    if (inviteDoc) {
      const invite = inviteDoc.data();
      role = "client";
      agentId = invite.agentId as string;
      clientId = invite.clientId as string;
      await updateDoc(inviteDoc.ref, { accepted: true });
    }
  }

  const newProfile: Omit<UserProfile, "id"> = {
    uid: u.uid,
    email: u.email || "",
    displayName: u.displayName || u.email?.split("@")[0] || "",
    role,
    ...(agentId && { agentId }),
    ...(clientId && { clientId }),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await setDoc(profileRef, newProfile);
  return { id: u.uid, ...newProfile };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const p = await resolveProfile(u);
          setProfile(p);
        } catch (err) {
          // Firestore profile fetch failed (missing index, permissions, etc.)
          // Fall back to agent role so the app still loads
          console.warn("Profile resolution failed, defaulting to agent:", err);
          setProfile({
            id: u.uid,
            uid: u.uid,
            email: u.email || "",
            displayName: u.displayName || u.email?.split("@")[0] || "",
            role: "agent",
            createdAt: Date.now(),
            updatedAt: Date.now(),
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
    <AuthContext.Provider value={{ user, profile, role: profile?.role ?? null, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
