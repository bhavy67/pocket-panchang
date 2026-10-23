import type {
  FestivalRule,
  Lang,
  LunarMonth,
  TithiFestival,
} from "./festival-types";

export type { FestivalRule } from "./festival-types";

/**
 * The 13 v1 festivals (§2, ADR 0018/0021). Rules are PROVISIONAL: `verified` stays empty until
 * Bhavy checks the computed dates by hand (docs/verification/), and a rule ships only when filled.
 * Months are Amanta (internal frame).
 */
const pending = { against: "", years: [] as number[] };
const names = (en: string, gu: string): Record<Lang, string> => ({
  en,
  gu,
  hi: en,
});
const tithi = (
  id: string,
  n: Record<Lang, string>,
  month: LunarMonth,
  paksha: "shukla" | "krishna",
  t: number,
  rest: Partial<TithiFestival> = {},
): TithiFestival => ({
  kind: "tithi",
  id,
  names: n,
  month,
  paksha,
  tithi: t,
  window: "sunrise",
  tieBreak: "purva-vyapini",
  adhikPolicy: "nija-only",
  verified: pending,
  ...rest,
});

export const FESTIVALS: readonly FestivalRule[] = [
  tithi(
    "maha-shivaratri",
    names("Maha Shivaratri", "મહા શિવરાત્રી"),
    "Magha",
    "krishna",
    14,
    { window: "nishita" },
  ),
  tithi(
    "holika-dahan",
    names("Holika Dahan", "હોલિકા દહન"),
    "Phalguna",
    "shukla",
    15,
    { window: "pradosh", avoidBhadra: true },
  ),
  {
    kind: "relative",
    id: "dhuleti",
    names: names("Dhuleti", "ધૂળેટી"),
    of: "holika-dahan",
    offsetDays: 1,
    verified: pending,
  },
  tithi(
    "raksha-bandhan",
    names("Raksha Bandhan", "રક્ષાબંધન"),
    "Shravana",
    "shukla",
    15,
    {
      window: "aparahna",
      tieBreak: "max-coverage",
      bhadraTiming: "show-after",
    },
  ),
  tithi(
    "janmashtami-smarta",
    names("Janmashtami", "જન્માષ્ટમી"),
    "Shravana",
    "krishna",
    8,
    {
      window: "nishita",
      extra: { nakshatra: 4 },
      variant: {
        group: "janmashtami",
        label: { en: "Smarta", gu: "સ્માર્ત", hi: "Smarta" },
      },
    },
  ),
  tithi(
    "janmashtami-vaishnava",
    names("Janmashtami", "જન્માષ્ટમી"),
    "Shravana",
    "krishna",
    8,
    {
      window: "sunrise",
      tieBreak: "para-vyapini",
      variant: {
        group: "janmashtami",
        label: { en: "Vaishnava", gu: "વૈષ્ણવ", hi: "Vaishnava" },
      },
    },
  ),
  tithi("navratri", names("Navratri", "નવરાત્રી"), "Ashvin", "shukla", 1, {
    span: { end: { paksha: "shukla", tithi: 9 } },
  }),
  tithi("dussehra", names("Dussehra", "દશેરા"), "Ashvin", "shukla", 10, {
    window: "aparahna",
    tieBreak: "max-coverage",
  }),
  tithi("dhanteras", names("Dhanteras", "ધનતેરસ"), "Ashvin", "krishna", 13, {
    window: "pradosh",
    tieBreak: "max-coverage",
  }),
  tithi(
    "kali-chaudas",
    names("Kali Chaudas", "કાળી ચૌદસ"),
    "Ashvin",
    "krishna",
    14,
    { window: "nishita", tieBreak: "max-coverage" },
  ),
  tithi("diwali", names("Diwali", "દિવાળી"), "Ashvin", "krishna", 15, {
    window: "pradosh",
    tieBreak: "max-coverage",
  }),
  tithi(
    "bestu-varas",
    names("Bestu Varas", "બેસતું વર્ષ"),
    "Kartika",
    "shukla",
    1,
  ),
  tithi("bhai-bij", names("Bhai Bij", "ભાઈ બીજ"), "Kartika", "shukla", 2, {
    window: "aparahna",
    tieBreak: "max-coverage",
  }),
  {
    kind: "sankranti",
    id: "uttarayan",
    names: names("Uttarayan", "ઉત્તરાયણ"),
    rashi: 9,
    afterSunset: "next-day",
    verified: pending,
  },
];
