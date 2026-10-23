// Android adapters (Phase 11), loaded only inside the Capacitor app (ports.ts).
import { App } from "@capacitor/app";
import { registerPlugin } from "@capacitor/core";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Share } from "@capacitor/share";
import { t } from "@/i18n";
import type { ReminderPort, SharePort } from "@/ports";

/** Brand-neutral channel id (ADR 0016): it outlives any rename. */
export const CHANNEL = "reminders";

async function ensureChannel() {
  await LocalNotifications.createChannel({
    id: CHANNEL,
    name: t("channelName"),
    description: t("channelDescription"),
    importance: 4, // high: heads-up, sound
    visibility: 1, // public on the lock screen (the title is the family's own label)
  });
}

export const androidReminders: ReminderPort = {
  async schedule(items) {
    await ensureChannel();
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length)
      await LocalNotifications.cancel({
        notifications: pending.notifications.map((n) => ({ id: n.id })),
      });
    if (!items.length) return;
    await LocalNotifications.schedule({
      notifications: items.map((r) => ({
        id: r.id,
        title: r.title,
        body: r.body,
        largeBody: r.body,
        channelId: CHANNEL,
        smallIcon: "ic_stat_panchang",
        autoCancel: true,
        // Exact when allowed (USE_EXACT_ALARM), firing in Doze; inexact fallback otherwise.
        schedule: { at: new Date(r.at), allowWhileIdle: true },
        extra: { eventId: r.eventId },
      })),
    });
  },
  async cancelAll() {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length)
      await LocalNotifications.cancel({
        notifications: pending.notifications.map((n) => ({ id: n.id })),
      });
  },
  async capability() {
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== "granted") return "none";
    const exact = await LocalNotifications.checkExactNotificationSetting();
    return exact.exact_alarm === "granted" ? "exact" : "unreliable";
  },
};

/** Writes the file to the cache directory and opens Android's share sheet. */
export const androidShare: SharePort = {
  async shareFile(name, data) {
    const { uri } = await Filesystem.writeFile({
      path: name,
      data: await data.text(),
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });
    await Share.share({ title: name, files: [uri] });
  },
};

// ---- Device health (local plugin: android/app/src/main/java/.../DeviceHealthPlugin.java) ----

type DeviceHealth = {
  status(): Promise<{
    ignoringBatteryOptimizations: boolean;
    manufacturer: string;
  }>;
  fontScale(): Promise<{ scale: number }>;
  openBatterySettings(): Promise<void>;
  openNotificationSettings(): Promise<void>;
};
export const DeviceHealth = registerPlugin<DeviceHealth>("DeviceHealth");

export type Health = {
  notifications: "granted" | "denied" | "prompt";
  exact: boolean;
  battery: "unrestricted" | "optimised";
  manufacturer: string;
};

export async function health(): Promise<Health> {
  const [perm, exact, device] = await Promise.all([
    LocalNotifications.checkPermissions(),
    LocalNotifications.checkExactNotificationSetting(),
    DeviceHealth.status(),
  ]);
  return {
    notifications:
      perm.display === "granted"
        ? "granted"
        : perm.display === "denied"
          ? "denied"
          : "prompt",
    exact: exact.exact_alarm === "granted",
    battery: device.ignoringBatteryOptimizations ? "unrestricted" : "optimised",
    manufacturer: device.manufacturer.toLowerCase(),
  };
}

export const requestNotificationPermission = () =>
  LocalNotifications.requestPermissions();
export const openExactAlarmSettings = () =>
  LocalNotifications.changeExactNotificationSetting();

/** A real notification through the same channel, one minute from now (screen-off test). */
export async function sendTestReminder() {
  await ensureChannel();
  await LocalNotifications.schedule({
    notifications: [
      {
        id: 1,
        title: t("testTitle"),
        body: t("testBody"),
        channelId: CHANNEL,
        smallIcon: "ic_stat_panchang",
        schedule: { at: new Date(Date.now() + 60_000), allowWhileIdle: true },
      },
    ],
  });
}

// ---- App lifecycle ----

/**
 * Android back button: close an open sheet first, then go back within the app, and from the
 * home screen (Today or first-run onboarding) send the app to the background, never kill it.
 */
export function setupLifecycle(handlers: {
  /** In-app history (the WebView's own canGoBack is unreliable with pushState routing). */
  canGoBack: () => boolean;
  goBack: () => void;
  goHome: () => void;
  isHome: () => boolean;
  onResume: () => void;
  openEvent: (id: string) => void;
}) {
  void App.addListener("backButton", () => {
    const sheet = document.querySelector<HTMLDialogElement>("dialog[open]");
    if (sheet) sheet.close();
    else if (handlers.isHome()) void App.minimizeApp();
    // Opened from a notification there may be no history: go to Today instead of closing.
    else if (handlers.canGoBack()) handlers.goBack();
    else handlers.goHome();
  });
  void App.addListener("resume", handlers.onResume);
  void LocalNotifications.addListener(
    "localNotificationActionPerformed",
    (a) => {
      const id = (a.notification.extra as { eventId?: unknown } | undefined)
        ?.eventId;
      if (typeof id === "string") handlers.openEvent(id);
    },
  );
}
