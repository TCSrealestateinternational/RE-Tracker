import { useEffect, useRef } from "react";

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

interface UseFocusTrapOptions {
  onEscape?: () => void;
  active?: boolean;
}

export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  options: UseFocusTrapOptions = {},
) {
  const { onEscape, active = true } = options;
  const containerRef = useRef<T>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    previousFocusRef.current = document.activeElement as HTMLElement;
    const container = containerRef.current;
    if (!container) return;

    const firstFocusable = container.querySelector<HTMLElement>(FOCUSABLE);
    if (firstFocusable) {
      requestAnimationFrame(() => firstFocusable.focus());
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (!container) return;

      if (e.key === "Escape" && onEscape) {
        e.stopPropagation();
        onEscape();
        return;
      }

      if (e.key !== "Tab") return;

      const focusableEls = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (focusableEls.length === 0) return;

      const first = focusableEls[0]!;
      const last = focusableEls[focusableEls.length - 1]!;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [active, onEscape]);

  return containerRef;
}
