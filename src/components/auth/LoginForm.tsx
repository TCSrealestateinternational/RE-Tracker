import { useState, type FormEvent } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { t, card, inputBase, btnPrimary, btnSecondary } from "@/styles/theme";

function friendlyAuthError(err: unknown): { message: string; code: string } {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes("email-already-in-use")) {
    return {
      code: "email-already-in-use",
      message: "An account with this email already exists. Try signing in instead, or reset your password below.",
    };
  }
  if (raw.includes("invalid-credential") || raw.includes("wrong-password") || raw.includes("user-not-found")) {
    return { code: "bad-credentials", message: "Invalid email or password. Please try again." };
  }
  if (raw.includes("invalid-email")) {
    return { code: "invalid-email", message: "Please enter a valid email address." };
  }
  if (raw.includes("weak-password")) {
    return { code: "weak-password", message: "Password must be at least 6 characters." };
  }
  if (raw.includes("too-many-requests")) {
    return { code: "too-many-requests", message: "Too many attempts. Please wait a moment and try again." };
  }
  if (raw.includes("network-request-failed")) {
    return { code: "network", message: "Network error. Please check your connection." };
  }
  return { code: "unknown", message: "Authentication failed. Please try again." };
}

export function LoginForm() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setErrorCode("");
    setResetSent(false);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      const { message, code } = friendlyAuthError(err);
      setError(message);
      setErrorCode(code);
    }
  }

  async function handleGoogle() {
    setError("");
    setErrorCode("");
    try {
      await signInWithGoogle();
    } catch (err) {
      const { message, code } = friendlyAuthError(err);
      setError(message);
      setErrorCode(code);
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError("Enter your email address above, then click Forgot Password.");
      setErrorCode("need-email");
      return;
    }
    setResetLoading(true);
    setError("");
    setErrorCode("");
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
    } catch (err) {
      const { message, code } = friendlyAuthError(err);
      setError(message);
      setErrorCode(code);
    } finally {
      setResetLoading(false);
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
      <div style={{
        ...card,
        width: "100%",
        maxWidth: "400px",
        padding: "40px",
      }}>
        <div style={{ marginBottom: "32px" }}>
          <span style={{ ...t.eyebrow, color: t.gold, display: "block", marginBottom: "8px" }}>
            Agent
          </span>
          <h1 style={{ ...t.pageTitle, color: t.text, margin: 0 }}>
            RE Tracker
          </h1>
          <p style={{ ...t.body, color: t.textTertiary, marginTop: "8px" }}>
            {isSignUp
              ? "Create your account to start tracking"
              : "Welcome back. Sign in to continue."}
          </p>
        </div>

        {resetSent && (
          <div
            role="status"
            aria-live="polite"
            style={{
              background: t.tealLight,
              color: t.teal,
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "20px",
              ...t.caption,
            }}
          >
            Password reset email sent to <strong>{email}</strong>. Check your inbox.
          </div>
        )}

        {error && (
          <div
            id="login-error"
            role="alert"
            aria-live="assertive"
            style={{
              background: t.rustLight,
              color: t.rust,
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "20px",
              ...t.caption,
            }}
          >
            {error}
            {errorCode === "email-already-in-use" && (
              <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => { setIsSignUp(false); setError(""); setErrorCode(""); }}
                  style={{
                    ...btnSecondary,
                    fontSize: "12px",
                    padding: "6px 14px",
                  }}
                >
                  Switch to Sign In
                </button>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  style={{
                    ...btnSecondary,
                    fontSize: "12px",
                    padding: "6px 14px",
                    opacity: resetLoading ? 0.6 : 1,
                  }}
                >
                  {resetLoading ? "Sending..." : "Send Password Reset"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Google sign-in */}
        <button
          type="button"
          onClick={handleGoogle}
          style={{
            ...btnSecondary,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "24px",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{
          display: "flex", alignItems: "center", gap: "16px",
          marginBottom: "24px",
        }}>
          <div style={{ flex: 1, height: "1px", background: t.border }} />
          <span style={{ ...t.caption, color: t.textTertiary }}>or</span>
          <div style={{ flex: 1, height: "1px", background: t.border }} />
        </div>

        {/* Email/password form */}
        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", marginBottom: "20px" }}>
            <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
              aria-describedby={error ? "login-error" : undefined}
              placeholder="you@example.com"
              style={inputBase}
            />
          </label>

          <label style={{ display: "block", marginBottom: "8px" }}>
            <span style={{ ...t.label, color: t.textSecondary, display: "block", marginBottom: "6px" }}>
              Password
            </span>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-required="true"
                aria-describedby={error ? "login-error" : undefined}
                minLength={6}
                placeholder="At least 6 characters"
                style={{ ...inputBase, paddingRight: "44px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: t.textTertiary,
                  minWidth: "32px",
                  minHeight: "32px",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </label>

          {!isSignUp && (
            <div style={{ textAlign: "right" as const, marginBottom: "20px" }}>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading}
                style={{
                  background: "none",
                  border: "none",
                  color: t.teal,
                  cursor: resetLoading ? "not-allowed" : "pointer",
                  padding: 0,
                  fontSize: "12px",
                  fontFamily: t.font,
                  fontWeight: 500,
                  opacity: resetLoading ? 0.6 : 1,
                }}
              >
                {resetLoading ? "Sending..." : "Forgot password?"}
              </button>
            </div>
          )}

          {isSignUp && <div style={{ marginBottom: "20px" }} />}

          <button type="submit" style={{
            ...btnPrimary, width: "100%",
          }}>
            {isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

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
      </div>
    </div>
  );
}
