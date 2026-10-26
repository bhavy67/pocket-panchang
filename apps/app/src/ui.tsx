// Shared components from the approved Today design (docs/design/screens.md). Shape + label,
// never colour alone: good = filled circle + tick, not good = diamond + bar, neutral = outlined
// circle + bar.
import { Link, Outlet } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { t } from "@/i18n";
import {
  installCardState,
  needsIosHint,
  promptInstall,
  saveInstallCardState,
  usePwa,
} from "@/pwa";
import { useSettings } from "@/settings";

export type Tone = "good" | "neutral" | "bad" | "rahu";

export function QualityIcon({
  tone,
  size = 24,
}: {
  tone: Tone;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="flex-none"
    >
      {tone === "good" ? (
        <>
          <circle cx="16" cy="16" r="15" className="fill-auspicious" />
          <path
            d="M9.5 16.5l4.5 4.5 8.5-9"
            fill="none"
            className="stroke-surface"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : tone === "neutral" ? (
        <>
          <circle
            cx="16"
            cy="16"
            r="13.5"
            fill="none"
            className="stroke-text-muted"
            strokeWidth="3.5"
          />
          <rect
            x="10"
            y="14.5"
            width="12"
            height="3.5"
            rx="1.5"
            className="fill-text-muted"
          />
        </>
      ) : (
        <>
          <rect
            x="5"
            y="5"
            width="22"
            height="22"
            rx="3"
            transform="rotate(45 16 16)"
            className={
              tone === "rahu" ? "fill-inauspicious" : "fill-text-muted"
            }
          />
          <rect
            x="10"
            y="14.5"
            width="12"
            height="3.5"
            rx="1.5"
            className="fill-surface"
          />
        </>
      )}
    </svg>
  );
}

export type SheetContent = {
  readonly kicker: string;
  readonly title: string;
  readonly range?: string;
  readonly body: string;
  readonly note?: string;
  /** Kicker colour. */
  readonly tone?: "accent" | "good" | "muted" | "rahu";
  readonly action?: {
    readonly label: string;
    readonly href: string;
    /** An in-app page (same tab) rather than an external site. */
    readonly internal?: boolean;
  };
};

const kickerInk = {
  accent: "text-accent",
  good: "text-auspicious",
  muted: "text-text-muted",
  rahu: "text-inauspicious",
} as const;

/** Bottom detail sheet on a native modal <dialog> (focus trap, Esc, and inert page for free). */
export function Sheet({
  content,
  onClose,
}: {
  content: SheetContent | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (content && d && !d.open) d.showModal?.();
    if (!content && d?.open) d.close();
  }, [content]);
  return (
    // Backdrop click closes too; the keyboard equivalent is Esc, which <dialog> handles natively.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-label={content?.title}
      className="sheet mx-auto mt-auto mb-0 w-full max-w-xl rounded-t-lg bg-surface-raised p-0 text-text shadow-(--elevation-3)"
    >
      {content && (
        <div className="flex flex-col gap-3 px-5 pt-3 pb-8">
          <span
            aria-hidden="true"
            className="h-1 w-10 self-center rounded-full bg-border"
          />
          <div className="flex flex-col gap-0.5">
            <span
              className={`text-sm font-label ${kickerInk[content.tone ?? "muted"]}`}
            >
              {content.kicker}
            </span>
            <h3 className="text-title leading-(--leading-heading) font-strong">
              {content.title}
            </h3>
            {content.range && (
              <span className="text-lg tabular-nums">{content.range}</span>
            )}
          </div>
          <p className="text-body">{content.body}</p>
          {content.note && (
            <p className="rounded-md bg-surface-sunken p-3 text-sm">
              {content.note}
            </p>
          )}
          {content.action &&
            (content.action.internal ? (
              <Link
                to={content.action.href}
                onClick={onClose}
                className={`${btnOutline} text-center`}
              >
                {content.action.label}
              </Link>
            ) : (
              <a
                href={content.action.href}
                target="_blank"
                rel="noreferrer"
                className={`${btnOutline} text-center`}
              >
                {content.action.label}
              </a>
            ))}
          <button
            type="button"
            onClick={onClose}
            className="min-h-13 rounded-md bg-accent text-body font-label text-text-on-accent focus-ring"
          >
            {t("close")}
          </button>
        </div>
      )}
    </dialog>
  );
}

export const btnOutline =
  "flex min-h-(--tap-min) items-center justify-center rounded-md border-[1.5px] border-border-strong bg-surface px-4 text-body font-label text-accent hover:bg-accent-subtle focus-ring disabled:cursor-not-allowed disabled:opacity-50";

export function Section({
  title,
  children,
  sub,
  id,
  flush = false,
}: {
  title: string;
  sub?: string;
  children: ReactNode;
  /** Anchor for in-app links (e.g. /settings#place). */
  id?: string;
  /** The parent already pads and spaces its sections. */
  flush?: boolean;
}) {
  return (
    <section id={id} className={`scroll-mt-4 ${flush ? "" : "px-4 pt-8"}`}>
      <h2
        className={`text-title leading-(--leading-heading) font-display font-heading tracking-display ${sub ? "" : "mb-3"}`}
      >
        {title}
      </h2>
      {sub && <p className="mt-1 mb-3 text-sm text-text-muted">{sub}</p>}
      {children}
    </section>
  );
}

// ---- App shell: bottom navigation on phones, side rail from 1024 px (brief §5). ----

const NAV = [
  {
    to: "/",
    label: "navToday",
    icon: (
      <>
        <circle cx="11" cy="11" r="5" className="fill-current" />
        <path
          d="M11 1v3M11 18v3M1 11h3M18 11h3M3.9 3.9l2.1 2.1M16 16l2.1 2.1M3.9 18.1L6 16M16 6l2.1-2.1"
          className="stroke-current"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    to: "/month",
    label: "navMonth",
    icon: (
      <>
        <rect
          x="2"
          y="4"
          width="18"
          height="16"
          rx="2.5"
          fill="none"
          className="stroke-current"
          strokeWidth="2"
        />
        <path
          d="M2 9h18M7 2v4M15 2v4"
          className="stroke-current"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    to: "/events",
    label: "navEvents",
    icon: (
      <path
        d="M5 2h12v18l-6-4-6 4z"
        fill="none"
        className="stroke-current"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    ),
  },
  {
    to: "/settings",
    label: "navSettings",
    icon: (
      <path
        d="M3 6h16M3 11h16M3 16h16"
        className="stroke-current"
        strokeWidth="2"
        strokeLinecap="round"
      />
    ),
  },
] as const;

const navItem =
  "flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 text-[length:min(var(--text-caption),20px)] [overflow-wrap:anywhere] focus-ring rounded-md";
const pill = "flex h-7.5 w-14 items-center justify-center rounded-full";

/**
 * Family preview (ADR 0013): data lives per web address and won't carry over to the final app,
 * so testers are asked to export before switching. Always visible, never dismissed.
 */
function PreviewBanner() {
  return (
    <p
      role="note"
      className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-warning bg-warning-subtle px-4 py-2 text-sm"
    >
      <strong className="font-label">{t("previewTitle")}</strong>
      <span>{t("previewBody")}</span>
      <Link
        to="/settings"
        hash="backup"
        className="font-label text-accent underline underline-offset-3 focus-ring"
      >
        {t("previewLink")}
      </Link>
    </p>
  );
}

/** A waiting update: the user decides when to reload (never mid-task). */
function UpdateBar() {
  const update = usePwa((p) => p.update);
  if (!update) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-20 z-20 mx-auto flex max-w-xl flex-wrap items-center justify-between gap-3 rounded-card bg-surface-raised p-4 shadow-(--elevation-3) lg:bottom-6"
    >
      <span className="text-body">{t("updateReady")}</span>
      <button
        type="button"
        onClick={() => void update()}
        className="flex min-h-(--tap-min) items-center rounded-md bg-accent px-4 text-body font-label text-text-on-accent focus-ring"
      >
        {t("updateReload")}
      </button>
    </div>
  );
}

/**
 * "Install the app": always in Settings; on Today only from the second visit and until
 * dismissed. iPhone gets the Share → Add to Home Screen steps instead.
 */
export function InstallCard({ where }: { where: "today" | "settings" }) {
  const install = usePwa((p) => p.install);
  const [state, setState] = useState(installCardState);
  const ios = needsIosHint();
  if (!install && !ios) return null;
  if (where === "today" && (state.dismissed || state.visits < 2)) return null;
  return (
    <div className="flex flex-col gap-3 px-card py-5 card">
      <p className="text-lg font-label">{t("installTitle")}</p>
      <p className="text-body">{ios ? t("installIos") : t("installBody")}</p>
      <div className="flex flex-wrap gap-2">
        {install && (
          <button
            type="button"
            onClick={() => void promptInstall()}
            className="flex min-h-(--tap-min) items-center rounded-md bg-accent px-5 text-body font-label text-text-on-accent focus-ring"
          >
            {t("installButton")}
          </button>
        )}
        {where === "today" && (
          <button
            type="button"
            className={btnOutline}
            onClick={() => {
              const next = { ...state, dismissed: true };
              saveInstallCardState(next);
              setState(next);
            }}
          >
            {t("notNow")}
          </button>
        )}
      </div>
    </div>
  );
}

export function Shell() {
  // Remount on a language change so every t() call re-runs (t is module-level).
  const language = useSettings((st) => st.settings?.language);
  return (
    <div key={language} className="min-h-dvh bg-bg text-text">
      {import.meta.env.VITE_FAMILY_PREVIEW === "1" && <PreviewBanner />}
      <div className="lg:flex">
        <nav
          aria-label={t("navMain")}
          className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-4 border-t border-border bg-surface px-2 pt-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] lg:sticky lg:top-0 lg:h-dvh lg:w-28 lg:flex-none lg:grid-cols-1 lg:content-start lg:gap-2 lg:border-t-0 lg:border-r lg:pt-6"
        >
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/", includeSearch: false }}
              className={`${navItem} text-text-muted data-[status=active]:font-strong data-[status=active]:text-accent [&[data-status=active]>span]:bg-accent-subtle`}
            >
              <span className={pill}>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  aria-hidden="true"
                >
                  {n.icon}
                </svg>
              </span>
              {t(n.label)}
            </Link>
          ))}
        </nav>
        <div className="min-w-0 flex-1 pb-24 lg:pb-8">
          <Outlet />
        </div>
        <UpdateBar />
      </div>
    </div>
  );
}
