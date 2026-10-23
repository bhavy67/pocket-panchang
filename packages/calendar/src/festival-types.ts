import type { LunarMonth } from "@panchang/engine";
import type { ObservanceWindow } from "./windows";

export type { LunarMonth } from "@panchang/engine";
export type Lang = "gu" | "en" | "hi";

/** §4.7, ADR 0018. */
export type FestivalBase = {
  readonly id: string;
  readonly names: Record<Lang, string>;
  /** Variants of one festival; label shown only when variants resolve to different days. */
  readonly variant?: {
    readonly group: string;
    readonly label: Record<Lang, string>;
  };
  /** Must be filled (source + years) before the festival ships (§0 rule 7). */
  readonly verified: {
    readonly against: string;
    readonly years: readonly number[];
  };
};

export type TithiFestival = FestivalBase & {
  readonly kind: "tithi";
  readonly month: LunarMonth;
  readonly paksha: "shukla" | "krishna";
  /** 1–15 within the paksha (15 = Purnima / Amavasya). */
  readonly tithi: number;
  readonly window: ObservanceWindow;
  readonly tieBreak: "purva-vyapini" | "para-vyapini" | "max-coverage";
  /** Preferred nakshatra (1–27) at the window, used when two days qualify (Rohini = 4). */
  readonly extra?: { readonly nakshatra?: number };
  /** Coverage inside Bhadra does not count (Holika Dahan). */
  readonly avoidBhadra?: boolean;
  /** Multi-day festival: ends on the day the end tithi resolves to (same window). */
  readonly span?: {
    readonly end: {
      readonly paksha: "shukla" | "krishna";
      readonly tithi: number;
    };
  };
  /** Show "after Bhadra" timing on the day (Raksha Bandhan); date resolution unchanged. */
  readonly bhadraTiming?: "show-after";
  readonly adhikPolicy: "nija-only";
};

export type SankrantiFestival = FestivalBase & {
  readonly kind: "sankranti";
  /** Sidereal rashi entered, 0 = Mesha … 9 = Makara. */
  readonly rashi: number;
  readonly afterSunset: "next-day" | "same-day";
};

export type RelativeFestival = FestivalBase & {
  readonly kind: "relative";
  readonly of: string;
  readonly offsetDays: number;
};

export type FestivalRule = TithiFestival | SankrantiFestival | RelativeFestival;
