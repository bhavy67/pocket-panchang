import { describe, expect, it } from "vitest";
import { lunationAt, samvatAt } from "./months";
import { nextSunrise, type Coordinates } from "./sun";
import { tithiAt } from "./tithi";
import { instant } from "./testing";
import type { Instant } from "./time";

const DAY_MS = 86_400_000;
const AHMEDABAD: Coordinates = { latitude: 23.025556, longitude: 72.587222 };
const ist = (t: number) =>
  new Date(t + 330 * 60_000).toISOString().slice(0, 10);

function lunations(from: string, count: number) {
  const out = [];
  let t = instant(from);
  for (let i = 0; i < count; i++) {
    const l = lunationAt(t);
    out.push(l);
    t = (l.end + DAY_MS) as Instant;
  }
  return out;
}

describe("Amanta month naming (§4.6)", () => {
  it("2026 has Adhik Jyeshtha, 17 May – 15 Jun IST, as on Drik Panchang", () => {
    const adhik = lunationAt(instant("2026-05-25T00:00:00Z"));
    expect([adhik.name, adhik.adhik, adhik.sankrantis.length]).toEqual([
      "Jyeshtha",
      true,
      0,
    ]);
    expect([ist(adhik.start), ist(adhik.end)]).toEqual([
      "2026-05-17",
      "2026-06-15",
    ]);
  });

  it("a normal year runs Chaitra → Phalguna with one sankranti per month (2027)", () => {
    const names = lunations("2027-04-15T00:00:00Z", 12).map(
      (l) => `${l.name}${l.adhik ? "*" : ""}:${l.sankrantis.length}`,
    );
    expect(names).toEqual([
      "Chaitra:1",
      "Vaishakha:1",
      "Jyeshtha:1",
      "Ashadha:1",
      "Shravana:1",
      "Bhadrapada:1",
      "Ashvin:1",
      "Kartika:1",
      "Margashirsha:1",
      "Pausha:1",
      "Magha:1",
      "Phalguna:1",
    ]);
  });

  it("1982–83 kshaya-masa cycle (ADR 0008): adhik Ashvin, a two-sankranti month, adhik Phalguna", () => {
    // Engine result; Drik's label for the two-sankranti month is a pending source verification (§13).
    const names = lunations("1982-08-25T00:00:00Z", 9).map(
      (l) =>
        `${l.name}${l.adhik ? " (adhik)" : ""}${l.absorbs ? ` +${l.absorbs}` : ""}`,
    );
    expect(names).toEqual([
      "Bhadrapada",
      "Ashvin (adhik)",
      "Ashvin",
      "Kartika",
      "Margashirsha",
      "Pausha +Magha",
      "Phalguna (adhik)",
      "Phalguna",
      "Chaitra",
    ]);
  });
});

describe("samvat (ADR 0020)", () => {
  it("22 Oct 2026: Gujarati (Kartikadi) 2082, Vikram (Chaitradi) 2083, Shaka 1948, as on Drik", () => {
    expect(samvatAt(instant("2026-10-22T01:09:30Z"))).toEqual({
      vikramKartikadi: 2082,
      vikramChaitradi: 2083,
      shaka: 1948,
    });
  });

  it("the Kartikadi year changes at the first sunrise after the Kartika new moon (Bestu Varas)", () => {
    const kartika = lunationAt(instant("2026-11-20T00:00:00Z"));
    expect(kartika.name).toBe("Kartika");
    const before = nextSunrise((kartika.start - DAY_MS) as Instant, AHMEDABAD);
    const after = nextSunrise(kartika.start, AHMEDABAD);
    if (before.kind !== "event" || after.kind !== "event")
      throw new Error("no sunrise");
    expect(samvatAt(before.at).vikramKartikadi).toBe(2082);
    expect(samvatAt(after.at).vikramKartikadi).toBe(2083);
    expect(tithiAt(after.at)).toBeGreaterThanOrEqual(1);
  });

  it("a kshaya pratipada still resolves: the new year starts on a Sud 2 sunrise", () => {
    // Search 2000–2040 for a Kartika or Chaitra whose first sunrise after the new moon is already tithi 2.
    let found: { sunrise: Instant; month: string } | null = null;
    let t = instant("2000-01-01T00:00:00Z");
    while (!found && t < instant("2040-01-01T00:00:00Z")) {
      const l = lunationAt(t);
      if (!l.adhik && (l.name === "Kartika" || l.name === "Chaitra")) {
        const rise = nextSunrise(l.start, AHMEDABAD);
        if (rise.kind === "event" && tithiAt(rise.at) === 2)
          found = { sunrise: rise.at, month: l.name };
      }
      t = (l.end + DAY_MS) as Instant;
    }
    expect(found).not.toBeNull();
    const { sunrise, month } = found!;
    const key = month === "Kartika" ? "vikramKartikadi" : "vikramChaitradi";
    expect(samvatAt(sunrise)[key]).toBe(
      samvatAt((sunrise - DAY_MS) as Instant)[key] + 1,
    );
  });
});
