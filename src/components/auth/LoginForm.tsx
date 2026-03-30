import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { t, card, inputBase, btnPrimary } from "@/styles/theme";

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
      background: t.bg,
      padding: "24px",
    }}>
      <form onSubmit={handleSubmit} style={{
        ...card,
        width: "100%",
        maxWidth: "400px",
        padding: "40px",
      }}>
        <div style={{ marginBottom: "32px" }}>
          <span style={{ ...t.label, color: t.textTertiary, display: "block", marginBottom: "4px" }}>
            Agent
          </span>
          <h1 style={{ ...t.pageTitle, color: t.text, margin: 0 }}>
            Time Tracker
          </h1>
          <p style={{ ...t.body, color: t.textTertiary, marginTop: "8px" }}>
            {isSignUp
              ? "Create your account to start tracking"
              : "Welcome back. Sign in to continue."}
          </p>
        </div>

        {error && (
          <div style={{
            background: t.rustLight,
            color: t.rust,
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            ...t.caption,
          }}>
            {error}
          </div>
        )}

        <label style={{ display: "block", marginBottom: "20px" }}>
          <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            style={inputBase}
          />
        </label>

        <label style={{ display: "block", marginBottom: "28px" }}>
          <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="At least 6 characters"
            style={inputBase}
          />
        </label>

        <button type="submit" style={{ ...btnPrimary, width: "100%" }}>
          {isSignUp ? "Create Account" : "Sign In"}
        </button>

        <p style={{
          textAlign: "center",
          marginTop: "20px",
          ...t.caption,
          color: t.textTertiary,
        }}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              background: "none",
              border: "none",
              color: t.teal,
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
              fontSize: "inherit",
              fontFamily: t.font,
            }}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </form>
    </div>
  );
}
