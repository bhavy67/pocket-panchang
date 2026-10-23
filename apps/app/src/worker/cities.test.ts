import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { indexCities, searchCities, type CityFile } from "./cities";

const file = JSON.parse(
  readFileSync(
    join(import.meta.dirname, "../../public/data/cities.json"),
    "utf8",
  ),
) as CityFile;
const index = indexCities(file);
const names = (q: string) => searchCities(index, q).map((c) => c.location.name);

describe("city search", () => {
  it("keeps every row of the bundled file", () => {
    expect(index).toHaveLength(file.rows.length);
  });

  it("finds big cities first and small Gujarat towns (brief §3.1)", () => {
    expect(names("ahmed")[0]).toBe("Ahmedabad");
    expect(names("Nadiad")).toContain("Nadiad");
    expect(names("unjha")).toContain("Unjha");
    expect(searchCities(index, "Unjha")[0]?.admin).toBe("Gujarat");
  });

  it("matches Indian alternate names, Latin and Gujarati", () => {
    expect(names("baroda")[0]).toBe("Vadodara");
    expect(names("bombay")[0]).toBe("Mumbai");
    expect(names("calcutta")[0]).toBe("Kolkata");
    expect(names("અમદાવાદ")[0]).toBe("Ahmedabad");
    expect(names("વડોદ")[0]).toBe("Vadodara");
  });

  it("matches diaspora cities, accents and word prefixes", () => {
    expect(names("edison")).toContain("Edison");
    expect(names("leicester")[0]).toBe("Leicester");
    expect(names("dhinagar")).toContain("Gandhinagar"); // substring tier
    expect(names("zurich")).toContain("Zürich"); // accents folded
    expect(searchCities(index, "a")).toEqual([]);
  });
});
