// Notifications health (§5.5, Phase 11): can reminders actually fire on this phone? Checks the
// notification permission, exact alarms and battery optimisation, with plain fix-it steps.
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { t } from "@/i18n";
import type { Health } from "@/native/android";
import { isNative } from "@/ports";
import { rescheduleReminders } from "@/reschedule";
import { btnOutline, card, QualityIcon } from "@/ui";

type Native = typeof import("@/native/android");

export function NotificationsHealth() {
  const [native, setNative] = useState<Native | null>(null);
  const [h, setH] = useState<Health | null>(null);
  const [status, setStatus] = useState("");
  const refresh = async (n: Native) => setH(await n.health());

  useEffect(() => {
    if (!isNative()) return;
    void import("@/native/android").then(async (n) => {
      setNative(n);
      await refresh(n);
    });
    // Coming back from a system settings screen: re-check.
    const onVisible = () => {
      if (document.visibilityState === "visible")
        void import("@/native/android").then(refresh);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  return (
    <main className="mx-auto flex max-w-180 flex-col gap-4 px-4 pt-4 pb-8">
      <Link to="/settings" className={`${btnOutline} self-start`}>
        {t("backToSettings")}
      </Link>
      <h1 className="text-headline leading-(--leading-heading) font-bold">
        {t("healthTitle")}
      </h1>
      {!isNative() ? (
        <div className={`flex flex-col gap-3 p-5 ${card}`}>
          <p className="text-body">{t("healthWeb")}</p>
          <Link to="/events" className={btnOutline}>
            {t("familyDates")}
          </Link>
        </div>
      ) : !h || !native ? null : (
        <>
          <p className="text-body text-text-muted">{t("healthIntro")}</p>
          <Check
            ok={h.notifications === "granted"}
            title={t("healthPermission")}
            okText={t("healthPermissionOk")}
            badText={t("healthPermissionBad")}
            action={
              h.notifications === "prompt"
                ? {
                    label: t("healthAllow"),
                    run: async () => {
                      await native.requestNotificationPermission();
                      await refresh(native);
                      await rescheduleReminders();
                    },
                  }
                : {
                    label: t("healthOpenSettings"),
                    run: () => native.DeviceHealth.openNotificationSettings(),
                  }
            }
          />
          <Check
            ok={h.exact}
            title={t("healthExact")}
            okText={t("healthExactOk")}
            badText={t("healthExactBad")}
            action={{
              label: t("healthOpenSettings"),
              run: () => native.openExactAlarmSettings().then(() => undefined),
            }}
          />
          <Check
            ok={h.battery === "unrestricted"}
            title={t("healthBattery")}
            okText={t("healthBatteryOk")}
            badText={t("healthBatteryBad")}
            action={{
              label: t("healthOpenSettings"),
              run: () => native.DeviceHealth.openBatterySettings(),
            }}
          />
          <BrandSteps manufacturer={h.manufacturer} />
          <div className={`flex flex-col gap-3 p-5 ${card}`}>
            <p className="text-lg font-semibold">{t("healthTestTitle")}</p>
            <p className="text-body">{t("healthTestBody")}</p>
            <button
              type="button"
              className={btnOutline}
              onClick={() =>
                void native
                  .sendTestReminder()
                  .then(() => setStatus(t("healthTestSent")))
              }
            >
              {t("healthTestButton")}
            </button>
            <p aria-live="polite" className="text-sm text-text-muted">
              {status}
            </p>
          </div>
        </>
      )}
    </main>
  );
}

function Check({
  ok,
  title,
  okText,
  badText,
  action,
}: {
  ok: boolean;
  title: string;
  okText: string;
  badText: string;
  action: { label: string; run: () => Promise<void> };
}) {
  return (
    <section className={`flex flex-col gap-3 p-5 ${card}`}>
      <div className="flex items-start gap-3">
        <QualityIcon tone={ok ? "good" : "rahu"} size={28} />
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className={`text-body ${ok ? "" : "text-inauspicious"}`}>
            <span className="sr-only">
              {ok ? t("healthOk") : t("healthNeedsAttention")}:{" "}
            </span>
            {ok ? okText : badText}
          </p>
        </div>
      </div>
      {!ok && (
        <button
          type="button"
          className={btnOutline}
          onClick={() => void action.run()}
        >
          {action.label}
        </button>
      )}
    </section>
  );
}

/** Phone makers that stop background alarms beyond stock Android: plain, step-by-step. */
function BrandSteps({ manufacturer }: { manufacturer: string }) {
  const steps = manufacturer.includes("samsung")
    ? t("healthSamsung")
    : /xiaomi|redmi|poco/.test(manufacturer)
      ? t("healthXiaomi")
      : null;
  if (!steps) return null;
  return (
    <section className={`flex flex-col gap-2 p-5 ${card}`}>
      <h2 className="text-lg font-semibold">
        {manufacturer.includes("samsung")
          ? t("healthSamsungTitle")
          : t("healthXiaomiTitle")}
      </h2>
      <ol className="flex list-decimal flex-col gap-1 pl-6 text-body">
        {steps.split("\n").map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
    </section>
  );
}
