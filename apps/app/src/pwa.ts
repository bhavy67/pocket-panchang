// PWA state (Phase 10): a waiting service-worker update, and the browser's install prompt.
// main.tsx feeds this store; the shell and Settings read it.
import { create } from "zustand";

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export const usePwa = create<{
  /** Set when a new version is waiting; calling it activates the update and reloads. */
  update: (() => Promise<void>) | null;
  install: InstallPrompt | null;
}>(() => ({ update: null, install: null }));

/** Captures Chrome/Android's install prompt so the app can offer it at a calm moment. */
export function listenForInstall() {
  addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    usePwa.setState({ install: e as InstallPrompt });
  });
  addEventListener("appinstalled", () => usePwa.setState({ install: null }));
}

export async function promptInstall() {
  const p = usePwa.getState().install;
  if (!p) return;
  await p.prompt();
  await p.userChoice;
  usePwa.setState({ install: null });
}

/** iPhone/iPad Safari has no install prompt: show "Add to Home Screen" steps instead. */
export const needsIosHint = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) &&
  !matchMedia("(display-mode: standalone)").matches;

// Per-device convenience only (artifact rule: never state that must persist): try/catch.
const KEY = "install-card";
export function installCardState(): { visits: number; dismissed: boolean } {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "{}") as {
      visits?: number;
      dismissed?: boolean;
    };
    return { visits: v.visits ?? 0, dismissed: v.dismissed ?? false };
  } catch {
    return { visits: 0, dismissed: false };
  }
}
export function saveInstallCardState(s: {
  visits: number;
  dismissed: boolean;
}) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* private mode: the card just shows again */
  }
}
