import { useEffect, useState, useCallback } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { t } from "@/styles/theme";
import type { TourStep } from "@/constants/tour-steps";

interface TourOverlayProps {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

/** Viewport-relative rect (from getBoundingClientRect) */
interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PAD = 8;
const TOOLTIP_GAP = 12;

function getTooltipWidth() {
  return Math.min(320, window.innerWidth - 32);
}

function getRect(target: string): Rect | null {
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function resolveTarget(target: string, attempt = 0): Promise<Rect | null> {
  return new Promise((resolve) => {
    const r = getRect(target);
    if (r) {
      resolve(r);
      return;
    }
    if (attempt < 5) {
      setTimeout(() => resolveTarget(target, attempt + 1).then(resolve), 200);
    } else {
      resolve(null);
    }
  });
}

function computeTooltipPos(
  rect: Rect,
  placement: TourStep["placement"],
): { top: number; left: number } {
  const tw = getTooltipWidth();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let top: number;
  let left: number;

  switch (placement) {
    case "bottom":
      top = rect.top + rect.height + PAD + TOOLTIP_GAP;
      left = rect.left + rect.width / 2 - tw / 2;
      break;
    case "top":
      top = rect.top - PAD - TOOLTIP_GAP - 160;
      left = rect.left + rect.width / 2 - tw / 2;
      break;
    case "right":
      top = rect.top + rect.height / 2 - 60;
      left = rect.left + rect.width + PAD + TOOLTIP_GAP;
      break;
    case "left":
      top = rect.top + rect.height / 2 - 60;
      left = rect.left - PAD - TOOLTIP_GAP - tw;
      break;
    default:
      top = rect.top + rect.height + PAD + TOOLTIP_GAP;
      left = rect.left;
  }

  // If tooltip would go off-screen, flip to bottom
  if (top < 8) {
    top = rect.top + rect.height + PAD + TOOLTIP_GAP;
  }
  if (top + 180 > vh) {
    top = rect.top - PAD - TOOLTIP_GAP - 160;
  }

  // Clamp horizontally
  left = Math.max(16, Math.min(left, vw - tw - 16));
  // Clamp vertically
  top = Math.max(8, Math.min(top, vh - 200));

  return { top, left };
}

export function TourOverlay({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
}: TourOverlayProps) {
  const [rect, setRect] = useState<Rect | null>(null);
  const tw = getTooltipWidth();
  const trapRef = useFocusTrap({ onEscape: onSkip, active: true });

  // Resolve target element position
  useEffect(() => {
    let cancelled = false;
    setRect(null);

    resolveTarget(step.target).then((r) => {
      if (cancelled) return;
      if (r) {
        // Scroll into view then re-measure
        const el = document.querySelector(`[data-tour="${step.target}"]`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => {
            if (!cancelled) {
              setRect(getRect(step.target));
            }
          }, 400);
        } else {
          setRect(r);
        }
      } else {
        setRect(null); // fallback: no target found
      }
    });

    return () => {
      cancelled = true;
    };
  }, [step.target]);

  // Update rect on scroll/resize
  const updateRect = useCallback(() => {
    const r = getRect(step.target);
    if (r) setRect(r);
  }, [step.target]);

  useEffect(() => {
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [updateRect]);

  // Tooltip position
  const fallbackPos = {
    top: window.innerHeight / 2 - 80,
    left: window.innerWidth / 2 - tw / 2,
  };
  const tooltipPos = rect
    ? computeTooltipPos(rect, step.placement)
    : fallbackPos;

  const isLast = stepIndex === totalSteps - 1;
  const isFirst = stepIndex === 0;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
      }}
    >
      {/* Dark overlay — click to dismiss */}
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, cursor: "pointer" }}
        onClick={onSkip}
        aria-hidden="true"
      >
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left - PAD}
                y={rect.top - PAD}
                width={rect.width + PAD * 2}
                height={rect.height + PAD * 2}
                rx={8}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.45)"
          mask="url(#tour-mask)"
        />
      </svg>

      {/* Tooltip card */}
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-step-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          top: tooltipPos.top,
          left: tooltipPos.left,
          width: tw,
          maxWidth: "calc(100vw - 32px)",
          background: t.surface,
          borderRadius: "12px",
          border: `1px solid ${t.border}`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          padding: "20px",
          fontFamily: t.font,
          zIndex: 10001,
          animation: "tour-fade-in 0.2s ease-out",
        }}
      >
        {/* Close button */}
        <button
          onClick={onSkip}
          aria-label="Close tour"
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            fontSize: "20px",
            color: t.textTertiary,
            cursor: "pointer",
            borderRadius: "6px",
            lineHeight: 1,
          }}
        >
          ×
        </button>

        {/* Step counter */}
        <div
          aria-live="polite"
          style={{
            fontSize: "12px",
            color: t.textTertiary,
            marginBottom: "8px",
          }}
        >
          Step {stepIndex + 1} of {totalSteps}
        </div>

        {/* Title */}
        <div
          id="tour-step-title"
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: t.text,
            marginBottom: "6px",
          }}
        >
          {step.title}
        </div>

        {/* Content */}
        <div
          style={{
            fontSize: "14px",
            lineHeight: 1.5,
            color: t.textSecondary,
            marginBottom: "20px",
          }}
        >
          {step.content}
        </div>

        {/* Navigation buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            onClick={onSkip}
            style={{
              background: "none",
              border: "none",
              color: t.textTertiary,
              fontSize: "14px",
              cursor: "pointer",
              fontFamily: t.font,
              padding: "10px 4px",
              minHeight: "44px",
            }}
          >
            Skip tour
          </button>
          <div style={{ display: "flex", gap: "8px" }}>
            {!isFirst && (
              <button
                onClick={onPrev}
                style={{
                  padding: "10px 16px",
                  minHeight: "44px",
                  background: "transparent",
                  border: `1px solid ${t.borderMedium}`,
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  color: t.textSecondary,
                  fontFamily: t.font,
                }}
              >
                Back
              </button>
            )}
            <button
              onClick={onNext}
              style={{
                padding: "10px 16px",
                minHeight: "44px",
                background: t.teal,
                color: t.textInverse,
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: t.font,
              }}
            >
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tour-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
