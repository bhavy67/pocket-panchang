import { expect, it } from "vitest";
import { monthName, tithiLabel } from "./index";

it("labels tithis the Gujarati way", () => {
  expect(tithiLabel(11, "en")).toBe("Sud 11");
  expect(tithiLabel(11, "gu")).toBe("સુદ ૧૧");
  expect(tithiLabel(15, "en")).toBe("Sud Punam");
  expect(tithiLabel(20, "en")).toBe("Vad 5");
  expect(tithiLabel(30, "gu")).toBe("વદ અમાસ");
  expect(monthName("Shravana", "en", true)).toBe("Adhik Shravan");
});

it("names tithis the everyday Gujarati way", async () => {
  const { tithiName } = await import("./index");
  expect(tithiName(11, "en")).toBe("Agiyaras");
  expect(tithiName(26, "gu")).toBe("અગિયારસ");
  expect(tithiName(15, "en")).toBe("Punam");
  expect(tithiName(30, "gu")).toBe("અમાસ");
});
