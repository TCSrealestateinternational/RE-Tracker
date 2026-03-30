import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/styles/theme";

export function LoginForm() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: theme.colors.gray50,
    }}>
      <form onSubmit={handleSubmit} style={{
        background: theme.colors.white,
        padding: "2.5rem",
        borderRadius: "12px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        width: "100%",
        maxWidth: "400px",
      }}>
        <h1 style={{ color: theme.colors.teal, marginBottom: "0.25rem", fontSize: "1.5rem" }}>
          Agent Time Tracker
        </h1>
        <p style={{ color: theme.colors.gray500, marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          {isSignUp ? "Create your account" : "Sign in to your account"}
        </p>

        {error && (
          <div style={{
            background: "#fef2f2",
            color: theme.colors.rust,
            padding: "0.75rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            fontSize: "0.85rem",
          }}>
            {error}
          </div>
        )}

        <label style={{ display: "block", marginBottom: "1rem" }}>
          <span style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.85rem", color: theme.colors.gray700 }}>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.625rem 0.75rem",
              border: `1px solid ${theme.colors.gray200}`,
              borderRadius: "8px",
              fontSize: "0.9rem",
              boxSizing: "border-box",
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "1.5rem" }}>
          <span style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.85rem", color: theme.colors.gray700 }}>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{
              width: "100%",
              padding: "0.625rem 0.75rem",
              border: `1px solid ${theme.colors.gray200}`,
              borderRadius: "8px",
              fontSize: "0.9rem",
              boxSizing: "border-box",
            }}
          />
        </label>

        <button type="submit" style={{
          width: "100%",
          padding: "0.75rem",
          background: theme.colors.teal,
          color: theme.colors.white,
          border: "none",
          borderRadius: "8px",
          fontSize: "0.95rem",
          fontWeight: 600,
          cursor: "pointer",
        }}>
          {isSignUp ? "Create Account" : "Sign In"}
        </button>

        <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.85rem", color: theme.colors.gray500 }}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              background: "none",
              border: "none",
              color: theme.colors.gold,
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
            }}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </form>
    </div>
  );
}
