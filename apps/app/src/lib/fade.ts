// Native-feeling theme/language switches (Phase 11.7). `document.startViewTransition` was tried
// first, but it crossfades two full-page *snapshots*; when the before/after layouts differed in
// height — a theme with its own fonts/sizes (since removed: every palette now shares one type
// system, 2026-10-27), a different language's text length, even just plain route navigation —
// both snapshots stayed visible together for the ~250ms animation, which read as doubled,
// ghosted text. A sequential fade-out → mutate → fade-in never shows two states at once, so it
// can't ghost no matter how different the layouts are (still used for language switches and
// light/dark, which can still reflow).
import { flushSync } from "react-dom";

const reducedMotion = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Fades `#root` out, runs `mutate`, fades back in; instant under reduced motion. */
export function withFade(mutate: () => void): void {
  const root = document.getElementById("root");
  if (!root || reducedMotion()) {
    mutate();
    return;
  }
  let settled = false;
  const apply = () => {
    if (settled) return;
    settled = true;
    flushSync(mutate);
    requestAnimationFrame(() => {
      root.style.opacity = "1";
    });
  };
  root.style.transition = "opacity 110ms ease";
  root.style.opacity = "0";
  root.addEventListener("transitionend", apply, { once: true });
  setTimeout(apply, 200); // safety net: transitionend can be missed (e.g. a backgrounded tab)
}
