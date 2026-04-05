import { useState, useEffect, useRef } from "react";
import { t, btnPrimary, btnSecondary } from "@/styles/theme";

const DISMISS_KEY = "re-tracker-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true
  );
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Already installed or already dismissed
    if (isStandalone() || localStorage.getItem(DISMISS_KEY)) return;

    if (isIOS()) {
      setShowIOSGuide(true);
      setVisible(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  async function install() {
    if (!deferredPrompt.current) return;
    await deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    deferredPrompt.current = null;
  }

  if (!visible) return null;

  return (
    <div style={styles.banner}>
      <div style={styles.content}>
        <div style={styles.icon}>
          <img src="/icon-192.svg" alt="" width={36} height={36} style={{ borderRadius: 6 }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={styles.title}>Add RE Tracker to your home screen</div>
          <div style={styles.subtitle}>
            {showIOSGuide
              ? <>Tap <strong>Share</strong> (the square with an arrow), then <strong>Add to Home Screen</strong>.</>
              : "Quick access — feels like a native app."}
          </div>
        </div>
      </div>
      <div style={styles.actions}>
        <button onClick={dismiss} style={styles.dismissBtn}>Not now</button>
        {!showIOSGuide && (
          <button onClick={install} style={styles.installBtn}>Install</button>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  banner: {
    margin: "12px 16px",
    padding: "16px",
    background: t.surface,
    border: `1px solid ${t.border}`,
    borderRadius: t.cardRadius,
    fontFamily: t.font,
  },
  content: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },
  icon: {
    flexShrink: 0,
  },
  title: {
    fontSize: "14px",
    fontWeight: 600,
    color: t.text,
    marginBottom: "4px",
  },
  subtitle: {
    fontSize: "13px",
    color: t.textSecondary,
    lineHeight: 1.4,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    marginTop: "12px",
  },
  dismissBtn: {
    ...btnSecondary,
    padding: "8px 16px",
    fontSize: "13px",
  },
  installBtn: {
    ...btnPrimary,
    padding: "8px 16px",
    fontSize: "13px",
  },
};
