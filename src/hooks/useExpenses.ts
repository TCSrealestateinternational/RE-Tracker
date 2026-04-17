import { useEffect, useState, useMemo } from "react";
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { Expense, ExpenseCategory } from "@/types";

export function useExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "expenses"),
      where("userId", "==", user.uid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Expense);
        docs.sort((a, b) => b.createdAt - a.createdAt);
        setExpenses(docs);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore expenses listener error:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, [user]);

  async function addExpense(data: Omit<Expense, "id" | "userId" | "createdAt" | "updatedAt">) {
    if (!user) throw new Error("You must be signed in to add an expense.");
    const now = Date.now();
    const payload = { ...data, userId: user.uid, createdAt: now, updatedAt: now };
    try {
      await addDoc(collection(db, "expenses"), payload);
    } catch (err) {
      console.error("addExpense FAILED:", err);
      throw err;
    }
  }

  async function updateExpense(id: string, data: Partial<Expense>) {
    await updateDoc(doc(db, "expenses", id), { ...data, updatedAt: Date.now() });
  }

  async function deleteExpense(id: string) {
    await deleteDoc(doc(db, "expenses", id));
  }

  // Computed YTD values — filtered to current calendar year
  const currentYear = new Date().getFullYear();

  const ytdExpenses = useMemo(
    () => expenses.filter((e) => e.date && e.date.startsWith(String(currentYear))),
    [expenses, currentYear]
  );

  const totalExpenses = useMemo(
    () => ytdExpenses.reduce((sum, e) => sum + (e.amount || 0), 0),
    [ytdExpenses]
  );

  const totalMileage = useMemo(
    () => ytdExpenses
      .filter((e) => e.type === "mileage")
      .reduce((sum, e) => sum + (e.miles || 0), 0),
    [ytdExpenses]
  );

  const expensesByCategory = useMemo(() => {
    const map: Partial<Record<ExpenseCategory, number>> = {};
    for (const e of ytdExpenses) {
      map[e.category] = (map[e.category] || 0) + (e.amount || 0);
    }
    return map;
  }, [ytdExpenses]);

  const monthlyTotals = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of ytdExpenses) {
      const month = e.date.slice(0, 7); // YYYY-MM
      map[month] = (map[month] || 0) + (e.amount || 0);
    }
    return Object.entries(map)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [ytdExpenses]);

  return {
    expenses, loading,
    addExpense, updateExpense, deleteExpense,
    totalExpenses, totalMileage, expensesByCategory, monthlyTotals,
  };
}
