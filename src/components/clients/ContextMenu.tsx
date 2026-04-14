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
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [onClose]);

  const menuW = 180;
  const menuH = actions.length * 42 + 8;
  const left = x + menuW > window.innerWidth ? x - menuW : x;
  const top = y + menuH > window.innerHeight ? y - menuH : y;

  return (
    <div ref={ref} style={{ ...styles.menu, left, top }}>
      {actions.map((action) => {
        const color = action.color || t.text;
        return (
          <button
            key={action.label}
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
