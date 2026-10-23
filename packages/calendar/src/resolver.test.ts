import { addDays } from "@panchang/engine";
import { describe, expect, it } from "vitest";
import { FESTIVALS } from "./festivals";
import {
  collapseVariants,
  resolveFestivals,
  type FestivalOccurrence,
} from "./resolver";
import { AHMEDABAD, CITIES, date, place } from "./testing";

const dayDiff = (a: string, b: string) =>
  (Date.parse(b) - Date.parse(a)) / 86_400_000;

describe.each(CITIES.map((c) => [c.name, c] as const))(
  "festivals 2026–27, %s",
  (_name, city) => {
    const byYear = (y: number): FestivalOccurrence[] =>
      resolveFestivals(
        FESTIVALS,
        date(`${y}-01-01`),
        date(`${y}-12-31`),
        place(city),
      );
    const years = [byYear(2026), byYear(2027)];
    const one = (list: FestivalOccurrence[], id: string) => {
      const hits = list.filter((o) => o.id === id);
      expect(hits, id).toHaveLength(1);
      return hits[0]!;
    };

    it("every rule resolves exactly once per year", () => {
      for (const list of years)
        for (const rule of FESTIVALS) one(list, rule.id);
    });

    it("Diwali sequence is ordered and compact; Dhuleti is the day after Holika Dahan", () => {
      for (const list of years) {
        const seq = [
          "dhanteras",
          "kali-chaudas",
          "diwali",
          "bestu-varas",
          "bhai-bij",
        ].map((id) => one(list, id).date);
        for (let i = 1; i < seq.length; i++) {
          expect(dayDiff(seq[i - 1]!, seq[i]!)).toBeGreaterThanOrEqual(0);
          expect(dayDiff(seq[i - 1]!, seq[i]!)).toBeLessThanOrEqual(2);
        }
        expect(one(list, "dhuleti").date).toBe(
          addDays(one(list, "holika-dahan").date, 1),
        );
      }
    });

    it("Holika Dahan carries an evening time inside pradosh and outside Bhadra", () => {
      for (const list of years) {
        const h = one(list, "holika-dahan");
        if (h.fallback) continue;
        expect(h.evening).toBeDefined();
        const minutes = (h.evening!.end - h.evening!.start) / 60_000;
        expect(minutes).toBeGreaterThan(0);
        expect(minutes).toBeLessThanOrEqual(3 * 48 + 30); // pradosh ≈ 3 night muhurtas
      }
    });

    it("Navratri spans 8–10 civil days and Dussehra falls on or after its last day", () => {
      for (const list of years) {
        const n = one(list, "navratri");
        const length = dayDiff(n.date, n.endDate!) + 1;
        expect(length).toBeGreaterThanOrEqual(8);
        expect(length).toBeLessThanOrEqual(10);
        expect(
          dayDiff(n.endDate!, one(list, "dussehra").date),
        ).toBeGreaterThanOrEqual(0);
      }
    });

    it("Janmashtami variants are at most a day apart; Uttarayan is 14 or 15 January", () => {
      for (const list of years) {
        expect(
          Math.abs(
            dayDiff(
              one(list, "janmashtami-smarta").date,
              one(list, "janmashtami-vaishnava").date,
            ),
          ),
        ).toBeLessThanOrEqual(1);
        expect(["01-14", "01-15"]).toContain(
          one(list, "uttarayan").date.slice(5),
        );
      }
    });
  },
);

describe("Ahmedabad 2026 spot values (provisional; verified by hand via docs/verification)", () => {
  const list = resolveFestivals(
    FESTIVALS,
    date("2026-01-01"),
    date("2026-12-31"),
    place(AHMEDABAD),
  );
  const at = (id: string) => list.find((o) => o.id === id)!.date;

  it("Diwali 8 Nov, Dhanteras 6 Nov, Janmashtami 4 Sep, Navratri from 11 Oct, Uttarayan 14 Jan", () => {
    expect([
      at("diwali"),
      at("dhanteras"),
      at("janmashtami-vaishnava"),
      at("navratri"),
      at("uttarayan"),
    ]).toEqual([
      "2026-11-08",
      "2026-11-06",
      "2026-09-04",
      "2026-10-11",
      "2026-01-14",
    ]);
  });
});

describe("collapseVariants (ADR 0018 rendering rule)", () => {
  const base = { names: { en: "Janmashtami", gu: "", hi: "" } };
  const v = (label: string, d: string): FestivalOccurrence => ({
    ...base,
    id: `j-${label}`,
    date: date(d),
    variant: {
      group: "janmashtami",
      label: { en: label, gu: label, hi: label },
    },
  });

  it("same day → one occurrence without a label", () => {
    const out = collapseVariants([
      v("Smarta", "2026-09-04"),
      v("Vaishnava", "2026-09-04"),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]!.variant).toBeUndefined();
  });

  it("different days → both, labelled", () => {
    const out = collapseVariants([
      v("Smarta", "2027-08-24"),
      v("Vaishnava", "2027-08-25"),
    ]);
    expect(out.map((o) => o.variant?.label.en)).toEqual([
      "Smarta",
      "Vaishnava",
    ]);
  });
});
