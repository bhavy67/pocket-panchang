// Platform ports (§5.5): web adapters here; Android adapters in native/android.ts, loaded only
// inside the Capacitor app so the web bundle carries none of them. GeoPort is v2 (ADR 0011).
import { Capacitor } from "@capacitor/core";
import type { Reminder } from "@/lib/reminders";

/** A reminder with its notification text, in the UI language. */
export type ReminderNotice = Reminder & {
  readonly title: string;
  readonly body: string;
};

export interface ReminderPort {
  /** Replaces every scheduled reminder with `items`. */
  schedule(items: readonly ReminderNotice[]): Promise<void>;
  cancelAll(): Promise<void>;
  capability(): Promise<"exact" | "unreliable" | "none">;
}

export interface SharePort {
  shareFile(name: string, data: Blob): Promise<void>;
}

/** The web has no reliable scheduled notifications: in-app list + .ics export instead (§5.5). */
export const webReminders: ReminderPort = {
  schedule: () => Promise.resolve(),
  cancelAll: () => Promise.resolve(),
  capability: () => Promise.resolve("none"),
};

export const webShare: SharePort = {
  async shareFile(name, data) {
    const file = new File([data], name, { type: data.type });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file] });
      return;
    }
    const url = URL.createObjectURL(file);
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: name,
    });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  },
};

export const isNative = () => Capacitor.isNativePlatform();

let ports: Promise<{ reminders: ReminderPort; share: SharePort }> | undefined;
/** The ports for this platform. */
export const platformPorts = () =>
  (ports ??= isNative()
    ? import("@/native/android").then((m) => ({
        reminders: m.androidReminders,
        share: m.androidShare,
      }))
    : Promise.resolve({ reminders: webReminders, share: webShare }));
