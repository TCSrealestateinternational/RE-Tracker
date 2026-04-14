import { useEffect, useRef } from "react";
import { Icon } from "@/components/shared/Icon";
import { t } from "@/styles/theme";
import type { CSSProperties } from "react";

export interface ContextMenuAction {
  label: string;
  iconName: string;
  color?: string;
  onClick: () => void;
}

interface ContextMenuProps {
  x: number;
  y: number;
  actions: ContextMenuAction[];
  onClose: () => void;
}

export function ContextMenu({ x, y, actions, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleScroll() {
      onClose();
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const items = ref.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
        if (!items || items.length === 0) return;
        const currentIndex = Array.from(items).findIndex(
          (el) => el === document.activeElement,
        );
        let nextIndex: number;
        if (e.key === "ArrowDown") {
          nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        } else {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        }
        items[nextIndex]?.focus();
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("scroll", handleScroll, true);
    document.addEventListener("keydown", handleKeyDown);

    requestAnimationFrame(() => {
      const firstItem = ref.current?.querySelector<HTMLElement>('[role="menuitem"]');
      firstItem?.focus();
    });

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("scroll", handleScroll, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const menuW = 180;
  const menuH = actions.length * 42 + 8;
  const left = x + menuW > window.innerWidth ? x - menuW : x;
  const top = y + menuH > window.innerHeight ? y - menuH : y;

  return (
    <div ref={ref} role="menu" aria-label="Client actions" style={{ ...styles.menu, left, top }}>
      {actions.map((action) => {
        const color = action.color || t.text;
        return (
          <button
            key={action.label}
            role="menuitem"
            tabIndex={-1}
            onClick={() => { action.onClick(); onClose(); }}
            style={{ ...styles.item, color }}
            onMouseEnter={(e) => { e.currentTarget.style.background = t.bg; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <Icon name={action.iconName} size={16} color={color} />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  menu: {
    position: "fixed",
    zIndex: 1000,
    minWidth: "170px",
    background: t.surface,
    border: `1px solid ${t.border}`,
    borderRadius: "10px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
    padding: "4px 0",
    fontFamily: t.font,
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    padding: "10px 16px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
    fontFamily: t.font,
    transition: "background 0.1s",
    textAlign: "left",
  },
};
