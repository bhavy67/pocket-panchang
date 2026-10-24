// Trust pages (§9, brief §3.7): "How this is calculated" and the privacy policy. Outside the
// onboarding gate so the public URLs (/how, /privacy) work for anyone, Play reviewers included.
import type { MessageKey } from "@panchang/i18n";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { t } from "@/i18n";
import { mismatchUrl } from "@/panchang";
import { todayIn } from "@/router";
import { useSettings } from "@/settings";
import { btnOutline } from "@/ui";

type Section = readonly [title: MessageKey, body: MessageKey];

function Page({
  title,
  intro,
  sections,
  children,
}: {
  title: MessageKey;
  intro?: MessageKey;
  sections: readonly Section[];
  children?: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-180 flex-col gap-6 bg-bg px-4 py-6 text-text">
      <Link to="/" className={`${btnOutline} self-start`}>
        {t("backHome")}
      </Link>
      <header className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-accent">{t("appName")}</p>
        <h1 className="text-headline leading-(--leading-heading) font-bold">
          {t(title)}
        </h1>
        {intro && <p className="text-sm text-text-muted">{t(intro)}</p>}
      </header>
      {sections.map(([h, body]) => (
        <section key={h} className="flex flex-col gap-2">
          <h2 className="text-title leading-(--leading-heading) font-bold">
            {t(h)}
          </h2>
          <p className="text-body">{t(body)}</p>
        </section>
      ))}
      {children}
    </main>
  );
}

export function HowPage() {
  const s = useSettings((st) => st.settings);
  return (
    <Page
      title="howCalculated"
      sections={[
        ["howDayTitle", "howDayBody"],
        ["howTithiTitle", "howTithiBody"],
        ["howStarsTitle", "howStarsBody"],
        ["howMonthsTitle", "howMonthsBody"],
        ["howTimesTitle", "howTimesBody"],
        ["howFamilyTitle", "howFamilyBody"],
        ["howAccuracyTitle", "howAccuracyBody"],
        ["howFestivalsTitle", "howFestivalsBody"],
        ["howPhoneTitle", "howPhoneBody"],
      ]}
    >
      <a
        href={
          s
            ? mismatchUrl(s, todayIn(s))
            : "https://github.com/bhavy67/pocket-panchang/issues/new"
        }
        target="_blank"
        rel="noreferrer"
        className={`${btnOutline} self-start`}
      >
        {t("reportMismatch")}
      </a>
      <Link
        to="/privacy"
        className="self-start text-body font-semibold text-accent underline underline-offset-3 focus-ring"
      >
        {t("privacyPolicy")}
      </Link>
    </Page>
  );
}

export function PrivacyPage() {
  return (
    <Page
      title="privacyPolicy"
      intro="privacyUpdated"
      sections={[
        ["privacyShortTitle", "privacyShort"],
        ["privacyStoredTitle", "privacyStored"],
        ["privacyFilesTitle", "privacyFiles"],
        ["privacyNetworkTitle", "privacyNetwork"],
        ["privacyPermissionsTitle", "privacyPermissions"],
        ["privacyChildrenTitle", "privacyChildren"],
        ["privacyChangesTitle", "privacyChanges"],
      ]}
    />
  );
}
