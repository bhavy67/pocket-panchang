// Platform ports (§5.5) with their web adapters. Capacitor adapters arrive in Phase 11.
// GeoPort is not defined: GPS is v2 (ADR 0011).
import type { Occurrence } from "@panchang/calendar";

export interface ReminderPort {
  schedule(items: readonly Occurrence[]): Promise<void>;
  cancelAll(): Promise<void>;
  capability(): "exact" | "unreliable" | "none";
}

export interface SharePort {
  shareFile(name: string, data: Blob): Promise<void>;
}

/** The web has no reliable scheduled notifications: in-app list + .ics export instead (§5.5). */
export const webReminders: ReminderPort = {
  schedule: () => Promise.resolve(),
  cancelAll: () => Promise.resolve(),
  capability: () => "none",
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
