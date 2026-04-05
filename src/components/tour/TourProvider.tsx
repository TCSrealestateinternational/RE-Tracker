import { createContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { TOUR_DEFINITIONS, type TourStep } from "@/constants/tour-steps";
import { TourOverlay } from "./TourOverlay";

interface TourContextValue {
  startTour: (tourId?: string) => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  isActive: boolean;
  currentStep: TourStep | null;
  stepIndex: number;
  totalSteps: number;
}

export const TourContext = createContext<TourContextValue | null>(null);

function getStorageKey(userId: string) {
  return `retracker-tours-${userId}`;
}

function getCompleted(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markCompleted(userId: string, tourId: string) {
  const completed = getCompleted(userId);
  completed.add(tourId);
  localStorage.setItem(getStorageKey(userId), JSON.stringify([...completed]));
}

export function TourProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user } = useAuth();
  const userId = user?.uid ?? "anon";

  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const autoTriggeredRef = useRef<Set<string>>(new Set());

  const tourDef = activeTourId
    ? Object.values(TOUR_DEFINITIONS).find((d) => d.id === activeTourId) ?? null
    : null;

  const currentStep = tourDef ? tourDef.steps[stepIndex] ?? null : null;
  const totalSteps = tourDef ? tourDef.steps.length : 0;

  const endTour = useCallback(() => {
    if (tourDef) {
      markCompleted(userId, tourDef.id);
    }
    setActiveTourId(null);
    setStepIndex(0);
  }, [tourDef, userId]);

  const startTour = useCallback(
    (tourId?: string) => {
      const id = tourId ?? TOUR_DEFINITIONS[location.pathname]?.id;
      if (!id) return;
      setActiveTourId(id);
      setStepIndex(0);
    },
    [location.pathname],
  );

  const nextStep = useCallback(() => {
    if (tourDef && stepIndex < tourDef.steps.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      endTour();
    }
  }, [tourDef, stepIndex, endTour]);

  const prevStep = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  // Auto-trigger on route change
  useEffect(() => {
    const def = TOUR_DEFINITIONS[location.pathname];
    if (!def) return;
    if (activeTourId) return; // already in a tour
    if (autoTriggeredRef.current.has(def.id)) return;

    const completed = getCompleted(userId);
    if (completed.has(def.id)) return;

    autoTriggeredRef.current.add(def.id);
    const timer = setTimeout(() => {
      setActiveTourId(def.id);
      setStepIndex(0);
    }, 800);
    return () => clearTimeout(timer);
  }, [location.pathname, userId, activeTourId]);

  return (
    <TourContext.Provider
      value={{
        startTour,
        endTour,
        nextStep,
        prevStep,
        isActive: !!activeTourId,
        currentStep,
        stepIndex,
        totalSteps,
      }}
    >
      {children}
      {activeTourId && currentStep && (
        <TourOverlay
          step={currentStep}
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={endTour}
        />
      )}
    </TourContext.Provider>
  );
}
