// Capacitor (Phase 11). Persistent identifiers are brand-neutral (ADR 0016).
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "in.bhavyladani.panchang",
  // ponytail: working name until the public name is chosen (§13, ADR 0016); UI label only.
  appName: "Pocket Panchang",
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
