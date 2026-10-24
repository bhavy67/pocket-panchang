// Capacitor (Phase 11). Persistent identifiers are brand-neutral (ADR 0016).
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "in.bhavyladani.panchang",
  // Public name (ADR 0016): UI label only; ids stay brand-neutral.
  appName: "Parivar Panchang",
  webDir: "dist",
  // WebView debugging follows the build type (on in debug, off in release): Capacitor default.
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_panchang",
      iconColor: "#0B6E79",
    },
  },
};

export default config;
