import { isParseError } from "@panchang/engine";
import { expect, it } from "vitest";
import { parseLocationId } from "./types";

it("parses GeoNames ids and rejects anything else (ADR 0014)", () => {
  expect(parseLocationId("1279233")).toBe("1279233");
  for (const bad of [
    "",
    "0",
    "01279233",
    "12345678901",
    "abc",
    "custom:23.0,72.6",
    " 1279233",
  ])
    expect(isParseError(parseLocationId(bad))).toBe(true);
});
