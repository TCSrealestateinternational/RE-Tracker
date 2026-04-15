import { Icon } from "@/components/shared/Icon";
import { t } from "@/styles/theme";

const NAV_ITEMS = [
  { label: "Home", path: "/", icon: "home" },
  { label: "Journey", path: "/journey", icon: "route" },
  { label: "Messages", path: "/messages", icon: "chat" },
  { label: "Profile", path: "/profile", icon: "person" },
];

interface BottomNavProps {
  activePath: string;
  onNavigate: (path: string) => void;
  unreadMessages?: number;
}

export function BottomNav({ activePath, onNavigate, unreadMessages = 0 }: BottomNavProps) {
  return (
    <nav
      aria-label="Client navigation"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: t.headerBlur,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: `1px solid ${t.border}`,
        display: "flex",
        justifyContent: "space-around",
        padding: "8px 0 max(8px, env(safe-area-inset-bottom))",
      }}
      role="tablist"
    >
      {NAV_ITEMS.map((item) => {
        const active = activePath === item.path;
        const isMessages = item.path === "/messages";
        return (
          <button
            key={item.path}
            role="tab"
            aria-selected={active}
            aria-current={active ? "page" : undefined}
            aria-label={isMessages && unreadMessages > 0 ? `${item.label}, ${unreadMessages} unread` : item.label}
            onClick={() => onNavigate(item.path)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              padding: "4px 20px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: t.font,
              fontSize: "11px",
              fontWeight: active ? 600 : 400,
              color: active ? t.teal : t.textTertiary,
              position: "relative",
              minWidth: "64px",
              minHeight: "44px",
              justifyContent: "center",
            }}
          >
            <div style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "56px",
              height: "28px",
              borderRadius: "100px",
              background: active ? t.primaryContainer : "transparent",
              transition: "background 0.2s",
            }}>
              <Icon name={item.icon} size={20} filled={active} />
              {isMessages && unreadMessages > 0 && (
                <span style={{
                  position: "absolute",
                  top: "0px",
                  right: "8px",
                  minWidth: "16px",
                  height: "16px",
                  borderRadius: "100px",
                  background: t.rust,
                  color: t.textInverse,
                  fontSize: "10px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px",
                }}>
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
