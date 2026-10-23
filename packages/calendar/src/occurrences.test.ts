import { describe, expect, it } from "vitest";
import {
  BUILTIN_POLICY,
  effectivePolicy,
  observanceLocation,
  occurrences,
  pitruPakshaTithi,
  type Household,
  type PersonalEvent,
} from "./occurrences";
import { AHMEDABAD, NEW_YORK, clockFor, date } from "./testing";

const household = (over: Partial<Household> = {}): Household => ({
  householdPolicy: {},
  location: AHMEDABAD,
  ...over,
});
const event = (
  over: Partial<PersonalEvent> & Pick<PersonalEvent, "lunarDate">,
): PersonalEvent => ({
  id: "e1",
  title: "Test",
  kind: "birthday",
  policyOverrides: {},
  remindDaysBefore: [0],
  ...over,
});
const dates = (e: PersonalEvent, h: Household, from: string, to: string) =>
  occurrences(e, h, date(from), date(to), clockFor).map(
    (o) => `${o.date}:${o.kind}${o.month ? ":" + o.month : ""}`,
  );

describe("policy cascade (ADR 0005)", () => {
  it("event override beats household default beats built-in, field by field", () => {
    const e = event({
      kind: "shraddh",
      lunarDate: { month: "Kartika", paksha: "shukla", tithi: 5 },
      policyOverrides: { vriddhiTithi: "second-day" },
    });
    const h = household({
      householdPolicy: {
        shraddh: { window: "sunrise", vriddhiTithi: "first-day" },
      },
    });
    expect(effectivePolicy(e, h)).toEqual({
      ...BUILTIN_POLICY.shraddh,
      window: "sunrise",
      vriddhiTithi: "second-day",
    });
  });

  it("observance location: event ?? household ?? viewing city (ADR 0007)", () => {
    const e = event({
      lunarDate: { month: "Kartika", paksha: "shukla", tithi: 5 },
    });
    expect(observanceLocation(e, household()).name).toBe("Ahmedabad");
    expect(
      observanceLocation(
        e,
        household({ location: NEW_YORK, observanceLocation: AHMEDABAD }),
      ).name,
    ).toBe("Ahmedabad");
    expect(
      observanceLocation({ ...e, observanceLocation: NEW_YORK }, household())
        .name,
    ).toBe("New York");
  });
});

describe("placement on real days (Drik, Ahmedabad, Oct 2026)", () => {
  it("vriddhi (Ashvin Sud 7 at sunrise on 17 and 18 Oct): first-day → 17 Oct, second-day → 18 Oct", () => {
    const e = event({
      lunarDate: { month: "Ashvin", paksha: "shukla", tithi: 7 },
    });
    expect(dates(e, household(), "2026-10-01", "2026-10-31")).toEqual([
      "2026-10-17:annual",
    ]);
    expect(
      dates(
        { ...e, policyOverrides: { vriddhiTithi: "second-day" } },
        household(),
        "2026-10-01",
        "2026-10-31",
      ),
    ).toEqual(["2026-10-18:annual"]);
  });

  it("kshaya (Bhadrapada Vad 8 at no sunrise, inside 3 Oct): same-day → 3 Oct, following-day → 4 Oct", () => {
    const e = event({
      lunarDate: { month: "Bhadrapada", paksha: "krishna", tithi: 8 },
    });
    expect(dates(e, household(), "2026-09-15", "2026-10-15")).toEqual([
      "2026-10-03:annual",
    ]);
    expect(
      dates(
        { ...e, policyOverrides: { kshayaTithi: "following-day" } },
        household(),
        "2026-09-15",
        "2026-10-15",
      ),
    ).toEqual(["2026-10-04:annual"]);
  });
});

describe("adhik-month years (ADR 0009): Jyeshtha Sud 5, 2026 has Adhik Jyeshtha", () => {
  const e = event({
    lunarDate: { month: "Jyeshtha", paksha: "shukla", tithi: 5 },
  });
  const run = (over: Partial<PersonalEvent>) =>
    dates({ ...e, ...over }, household(), "2026-04-01", "2026-08-01");

  it("nija (default) → only the regular month; adhik → only the extra month; both → two", () => {
    const [nija] = run({});
    const [adhik] = run({ policyOverrides: { adhikMonth: "adhik" } });
    expect(nija).toMatch(/:annual:nija$/);
    expect(adhik).toMatch(/:annual:adhik$/);
    expect(run({ policyOverrides: { adhikMonth: "both" } })).toEqual([
      adhik,
      nija,
    ]);
  });

  it("match-origin follows the original date's adhik flag", () => {
    expect(
      run({
        policyOverrides: { adhikMonth: "match-origin" },
        lunarDate: { ...e.lunarDate, adhik: true },
      })[0],
    ).toMatch(/:adhik$/);
    expect(run({ policyOverrides: { adhikMonth: "match-origin" } })[0]).toMatch(
      /:nija$/,
    );
  });

  it("a normal year (2027) has one occurrence, no month tag", () => {
    expect(dates(e, household(), "2027-04-01", "2027-08-01")).toEqual([
      expect.stringMatching(/:annual$/),
    ]);
  });
});

describe("Pitru Paksha (ADR 0004)", () => {
  it("maps the death tithi into Bhadrapada Krishna; Purnima → Bhadrapada Purnima; override wins", () => {
    expect(
      pitruPakshaTithi({ month: "Kartika", paksha: "shukla", tithi: 5 }),
    ).toBe(20);
    expect(
      pitruPakshaTithi({ month: "Kartika", paksha: "krishna", tithi: 5 }),
    ).toBe(20);
    expect(
      pitruPakshaTithi({ month: "Kartika", paksha: "shukla", tithi: 15 }),
    ).toBe(15);
    expect(
      pitruPakshaTithi({ month: "Kartika", paksha: "krishna", tithi: 15 }),
    ).toBe(30);
    expect(
      pitruPakshaTithi({ month: "Kartika", paksha: "shukla", tithi: 5 }, 9),
    ).toBe(24);
  });

  it("a shraddh yields an annual and a Pitru Paksha occurrence; disabled by policy → annual only", () => {
    const e = event({
      kind: "shraddh",
      lunarDate: { month: "Kartika", paksha: "shukla", tithi: 5 },
    });
    const kinds = occurrences(
      e,
      household(),
      date("2026-01-01"),
      date("2026-12-31"),
      clockFor,
    ).map((o) => o.kind);
    expect(kinds.sort()).toEqual(["annual", "pitru-paksha"]);
    const off = occurrences(
      { ...e, policyOverrides: { pitruPaksha: false } },
      household(),
      date("2026-01-01"),
      date("2026-12-31"),
      clockFor,
    );
    expect(off.map((o) => o.kind)).toEqual(["annual"]);
  });

  it("same-day collision (death in Bhadrapada Krishna): both occurrences are emitted", () => {
    const e = event({
      kind: "shraddh",
      lunarDate: { month: "Bhadrapada", paksha: "krishna", tithi: 10 },
    });
    const o = occurrences(
      e,
      household(),
      date("2026-01-01"),
      date("2026-12-31"),
      clockFor,
    );
    expect(o.map((x) => x.kind).sort()).toEqual(["annual", "pitru-paksha"]);
    expect(o[0]!.date).toBe(o[1]!.date);
  });
});

describe("observance location changes the day (ADR 0007)", () => {
  it("the same event computed for Ahmedabad and New York can fall on different civil dates", () => {
    const e = event({
      lunarDate: { month: "Kartika", paksha: "krishna", tithi: 5 },
    });
    let differs = 0;
    for (let y = 2026; y <= 2035; y++) {
      const [a] = occurrences(
        e,
        household(),
        date(`${y}-01-01`),
        date(`${y}-12-31`),
        clockFor,
      );
      const [n] = occurrences(
        { ...e, observanceLocation: NEW_YORK },
        household(),
        date(`${y}-01-01`),
        date(`${y}-12-31`),
        clockFor,
      );
      if (a && n && a.date !== n.date) differs++;
      expect(n?.observance.name).toBe("New York");
    }
    expect(differs).toBeGreaterThan(0);
  });
});
