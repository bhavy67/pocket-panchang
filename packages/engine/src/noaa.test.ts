// Independent sunrise/sunset check (§10): NOAA's published solar equations (public domain,
// https://gml.noaa.gov/grad/solcalc/calcdetails.html). Zenith 90.833° = upper limb + 34′
// refraction, the same definition as the engine default (ADR 0012). NOAA states ~1 min
// accuracy within ±72° latitude.
import { describe, expect, it } from "vitest";
import { nextSunrise, nextSunset } from "./sun";
import { localMidnight } from "./testing";
import { CITIES } from "../tools/cities";

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** NOAA sunrise (−1) / sunset (+1) for a UTC instant guess; returns ms since epoch. */
function noaaEvent(
  sign: -1 | 1,
  guessMs: number,
  latitude: number,
  longitude: number,
): number {
  let t = guessMs;
  for (let i = 0; i < 3; i++) {
    const jc = (t / 86_400_000 + 2440587.5 - 2451545) / 36525;
    const l0 = (280.46646 + jc * (36000.76983 + jc * 0.0003032)) % 360;
    const m = 357.52911 + jc * (35999.05029 - 0.0001537 * jc);
    const e = 0.016708634 - jc * (0.000042037 + 0.0000001267 * jc);
    const c =
      Math.sin(rad(m)) * (1.914602 - jc * (0.004817 + 0.000014 * jc)) +
      Math.sin(rad(2 * m)) * (0.019993 - 0.000101 * jc) +
      Math.sin(rad(3 * m)) * 0.000289;
    const omega = 125.04 - 1934.136 * jc;
    const appLong = l0 + c - 0.00569 - 0.00478 * Math.sin(rad(omega));
    const obliq =
      23 +
      (26 + (21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813))) / 60) /
        60 +
      0.00256 * Math.cos(rad(omega));
    const decl = deg(Math.asin(Math.sin(rad(obliq)) * Math.sin(rad(appLong))));
    const y = Math.tan(rad(obliq / 2)) ** 2;
    const eqTime =
      4 *
      deg(
        y * Math.sin(2 * rad(l0)) -
          2 * e * Math.sin(rad(m)) +
          4 * e * y * Math.sin(rad(m)) * Math.cos(2 * rad(l0)) -
          0.5 * y * y * Math.sin(4 * rad(l0)) -
          1.25 * e * e * Math.sin(2 * rad(m)),
      );
    const ha = deg(
      Math.acos(
        Math.cos(rad(90.833)) /
          (Math.cos(rad(latitude)) * Math.cos(rad(decl))) -
          Math.tan(rad(latitude)) * Math.tan(rad(decl)),
      ),
    );
    const dayStart =
      Math.floor((t + (longitude / 15) * 3_600_000) / 86_400_000) * 86_400_000 -
      (longitude / 15) * 3_600_000;
    const noonMinutesUtc = 720 - 4 * longitude - eqTime; // minutes after 00:00 UTC of the solar date
    const minutes = noonMinutesUtc + sign * 4 * ha;
    t =
      Math.floor(dayStart / 86_400_000) * 86_400_000 +
      minutes * 60_000 +
      (dayStart % 86_400_000 > 43_200_000 ? 86_400_000 : 0);
  }
  return t;
}

describe("engine vs NOAA solar equations: every day of 2026–2027", () => {
  it.each(CITIES.map((c) => [c.name, c] as const))(
    "%s: sunrise and sunset within ±1 min",
    (_name, city) => {
      let worst = 0;
      for (
        let t = Date.parse("2026-01-01T12:00:00Z");
        t < Date.parse("2028-01-01T00:00:00Z");
        t += 86_400_000
      ) {
        const date = new Date(t).toISOString().slice(0, 10);
        const midnight = localMidnight(date, city.tz);
        for (const [sign, event] of [
          [-1, nextSunrise(midnight, city)],
          [1, nextSunset(midnight, city)],
        ] as const) {
          if (event.kind !== "event") throw new Error(`no event ${date}`);
          const diff = Math.abs(
            event.at - noaaEvent(sign, event.at, city.latitude, city.longitude),
          );
          worst = Math.max(worst, diff);
        }
      }
      expect(worst).toBeLessThanOrEqual(60_000);
    },
  );
});
