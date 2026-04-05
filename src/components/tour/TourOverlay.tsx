import { useEffect, useState, useRef } from "react";
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

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PAD = 8;
const TOOLTIP_W = 320;
const TOOLTIP_GAP = 12;

function resolveTarget(target: string, attempt = 0): Promise<Rect | null> {
  return new Promise((resolve) => {
    const el = document.querySelector(`[data-tour="${target}"]`);
    if (el) {
      const r = el.getBoundingClientRect();
      resolve({ top: r.top + window.scrollY, left: r.left + window.scrollX, width: r.width, height: r.height });
      return;
    }
    if (attempt < 3) {
      setTimeout(() => resolveTarget(target, attempt + 1).then(resolve), 200);
    } else {
      resolve(null);
    }
  });
}

function clampTooltip(pos: { top: number; left: number }): { top: number; left: number } {
  const maxLeft = window.innerWidth - TOOLTIP_W - 16;
  return {
    top: Math.max(8, Math.min(pos.top, window.innerHeight + window.scrollY - 300)),
    left: Math.max(8, Math.min(pos.left, maxLeft)),
  };
}

function computeTooltipPos(rect: Rect, placement: TourStep["placement"]): { top: number; left: number } {
  switch (placement) {
    case "bottom":
      return { top: rect.top + rect.height + PAD + TOOLTIP_GAP, left: rect.left + rect.width / 2 - TOOLTIP_W / 2 };
    case "top":
      return { top: rect.top - PAD - TOOLTIP_GAP - 160, left: rect.left + rect.width / 2 - TOOLTIP_W / 2 };
    case "right":
      return { top: rect.top + rect.height / 2 - 60, left: rect.left + rect.width + PAD + TOOLTIP_GAP };
    case "left":
      return { top: rect.top + rect.height / 2 - 60, left: rect.left - PAD - TOOLTIP_GAP - TOOLTIP_W };
    default:
      return { top: rect.top + rect.height + PAD + TOOLTIP_GAP, left: rect.left };
  }
}

export function TourOverlay({ step, stepIndex, totalSteps, onNext, onPrev, onSkip }: TourOverlayProps) {
  const [rect, setRect] = useState<Rect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setRect(null);
    resolveTarget(step.target).then((r) => {
      if (!cancelled) setRect(r);
    });
    return () => { cancelled = true; };
  }, [step.target]);

  // Scroll target into view
  useEffect(() => {
    if (!rect) return;
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // Re-resolve after scroll
      setTimeout(() => {
        resolveTarget(step.target).then((r) => { if (r) setRect(r); });
      }, 350);
    }
  }, [rect?.top, step.target]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fallback: center tooltip if no target found
  const fallbackPos = {
    top: window.innerHeight / 2 - 80 + window.scrollY,
    left: window.innerWidth / 2 - TOOLTIP_W / 2,
  };
  const tooltipPos = rect ? clampTooltip(computeTooltipPos(rect, step.placement)) : fallbackPos;

  const isLast = stepIndex === totalSteps - 1;
  const isFirst = stepIndex === 0;

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        pointerEvents: "auto",
      }}
    >
      {/* SVG overlay with cutout */}
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left - PAD + window.scrollX * -1 + (rect.left - (rect.left - window.scrollX)) * 0}
                y={rect.top - PAD - window.scrollY}
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
        style={{
          position: "absolute",
          top: tooltipPos.top - window.scrollY,
          left: tooltipPos.left,
          width: TOOLTIP_W,
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
        {/* Step counter */}
        <div style={{ ...t.label, color: t.textTertiary, marginBottom: "8px" }}>
          {stepIndex + 1} of {totalSteps}
        </div>

        {/* Title */}
        <div style={{ ...t.sectionHeader, color: t.text, marginBottom: "6px" }}>
          {step.title}
        </div>

        {/* Content */}
        <div style={{ ...t.body, color: t.textSecondary, marginBottom: "20px" }}>
          {step.content}
        </div>

        {/* Navigation buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={onSkip}
            style={{
              background: "none",
              border: "none",
              color: t.textTertiary,
              fontSize: "13px",
              cursor: "pointer",
              fontFamily: t.font,
              padding: "6px 0",
            }}
          >
            Skip tour
          </button>
          <div style={{ display: "flex", gap: "8px" }}>
            {!isFirst && (
              <button
                onClick={onPrev}
                style={{
                  padding: "8px 16px",
                  background: "transparent",
                  border: `1px solid ${t.borderMedium}`,
                  borderRadius: "8px",
                  fontSize: "13px",
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
                padding: "8px 16px",
                background: t.teal,
                color: t.textInverse,
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
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

      {/* Keyframe animation (injected once) */}
      <style>{`
        @keyframes tour-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
