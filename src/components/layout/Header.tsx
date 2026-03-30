import { useAuth } from "@/context/AuthContext";
import { theme } from "@/styles/theme";

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header style={{
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      padding: "0.75rem 1.5rem",
      borderBottom: `1px solid ${theme.colors.gray200}`,
      background: theme.colors.white,
    }}>
      <span style={{ fontSize: "0.85rem", color: theme.colors.gray500, marginRight: "1rem" }}>
        {user?.email}
      </span>
      <button
        onClick={signOut}
        style={{
          padding: "0.4rem 1rem",
          background: "transparent",
          border: `1px solid ${theme.colors.gray300}`,
          borderRadius: "6px",
          fontSize: "0.8rem",
          cursor: "pointer",
          color: theme.colors.gray700,
        }}
      >
        Sign Out
      </button>
    </header>
  );
}
