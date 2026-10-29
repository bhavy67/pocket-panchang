import type {
  FestivalRule,
  Lang,
  LunarMonth,
  TithiFestival,
} from "./festival-types";

export type { FestivalRule } from "./festival-types";

/**
 * The 13 v1 festivals (§2, ADR 0018/0021). `verified` is filled per rule from
 * docs/verification/festivals-ahmedabad.md (§0 rule 7); a (rule, year) ships only once its year
 * is in `verified.years`. Months are Amanta (internal frame).
 */
const pending = { against: "", years: [] as number[] };

/** Drik Panchang + published Gujarat/India holiday lists, 2026–2030 (§0 rule 7 Tier 1/2). */
const verifiedAllYears = {
  against:
    "Drik Panchang + Gujarat/India holiday lists (2026–2027, 2+ sources/year); Drik Panchang (2028–2030, Tier 2) — docs/verification/festivals-ahmedabad.md",
  years: [2026, 2027, 2028, 2029, 2030],
};
/** Verified for 2027 only: 2026 has a genuine published-source disagreement (see the rule's own
 * `verified.against` below), which also blocks the 2028–2030 Tier 2 years. */
const verified2027Only = (why: string) => ({
  against: `Drik Panchang + Gujarat holiday list (2027). 2026: ${why} — docs/verification/festivals-ahmedabad.md`,
  years: [2027],
});
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
    { window: "nishita", verified: verifiedAllYears },
  ),
  tithi(
    "holika-dahan",
    names("Holika Dahan", "હોલિકા દહન"),
    "Phalguna",
    "shukla",
    15,
    {
      window: "pradosh",
      avoidBhadra: true,
      verified: verified2027Only(
        "the Mar 2026 lunar eclipse genuinely split published panchangs between Mar 2 and Mar 3 (our computed date); not a clean 2-source agreement either way",
      ),
    },
  ),
  {
    kind: "relative",
    id: "dhuleti",
    names: names("Dhuleti", "ધૂળેટી"),
    of: "holika-dahan",
    offsetDays: 1,
    verified: verified2027Only(
      "follows holika-dahan, so inherits its 2026 eclipse-year disagreement",
    ),
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
      verified: {
        against:
          "Unresolved: Drik Panchang, Gujarat holiday lists, and officeholidays.com consistently date Raksha Bandhan one day later than this rule computes (2026, 2027, 2028 all checked) — the rule likely needs Bhadra-avoidance in date resolution itself, not just the 'after Bhadra' display timing. docs/verification/festivals-ahmedabad.md",
        years: [],
      },
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
      verified: verifiedAllYears,
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
      verified: verifiedAllYears,
    },
  ),
  tithi("navratri", names("Navratri", "નવરાત્રી"), "Ashvin", "shukla", 1, {
    span: { end: { paksha: "shukla", tithi: 9 } },
    verified: verified2027Only(
      "our span-end (Sud 9) resolves to the same day as Dussehra (Sud 10) — published sources put Maha Navami a day earlier; most of India (and Drik Panchang) agree with us only in the minority West Bengal/South Indian convention, not the mainstream one our Navratri band should follow",
    ),
  }),
  tithi("dussehra", names("Dussehra", "દશેરા"), "Ashvin", "shukla", 10, {
    window: "aparahna",
    tieBreak: "max-coverage",
    verified: verifiedAllYears,
  }),
  tithi("dhanteras", names("Dhanteras", "ધનતેરસ"), "Ashvin", "krishna", 13, {
    window: "pradosh",
    tieBreak: "max-coverage",
    verified: verifiedAllYears,
  }),
  tithi(
    "kali-chaudas",
    names("Kali Chaudas", "કાળી ચૌદસ"),
    "Ashvin",
    "krishna",
    14,
    { window: "nishita", tieBreak: "max-coverage", verified: verifiedAllYears },
  ),
  tithi("diwali", names("Diwali", "દિવાળી"), "Ashvin", "krishna", 15, {
    window: "pradosh",
    tieBreak: "max-coverage",
    verified: verifiedAllYears,
  }),
  tithi(
    "bestu-varas",
    names("Bestu Varas", "બેસતું વર્ષ"),
    "Kartika",
    "shukla",
    1,
    { verified: verifiedAllYears },
  ),
  tithi("bhai-bij", names("Bhai Bij", "ભાઈ બીજ"), "Kartika", "shukla", 2, {
    window: "aparahna",
    tieBreak: "max-coverage",
    verified: verifiedAllYears,
  }),
  {
    kind: "sankranti",
    id: "uttarayan",
    names: names("Uttarayan", "ઉત્તરાયણ"),
    rashi: 9,
    afterSunset: "next-day",
    verified: verifiedAllYears,
  },

  // 17 more (ADR 0027, Phase 13): broader Gujarati/pan-Hindu + ISKCON/Vaishnav coverage.
  // Provisional, same as the 13 above started — `verified` stays `pending` until checked
  // against published sources for 2026–2030 (docs/verification/festivals-ahmedabad.md).
  tithi(
    "ganesh-chaturthi",
    names("Ganesh Chaturthi", "ગણેશ ચતુર્થી"),
    "Bhadrapada",
    "shukla",
    4,
    { window: "madhyahna", tieBreak: "max-coverage" },
  ),
  tithi("ram-navami", names("Ram Navami", "રામ નવમી"), "Chaitra", "shukla", 9, {
    window: "madhyahna",
    tieBreak: "max-coverage",
  }),
  tithi(
    "vasant-panchami",
    names("Vasant Panchami", "વસંત પંચમી"),
    "Magha",
    "shukla",
    5,
  ),
  tithi(
    "guru-purnima",
    names("Guru Purnima", "ગુરુ પૂર્ણિમા"),
    "Ashadha",
    "shukla",
    15,
  ),
  tithi(
    "akshaya-tritiya",
    names("Akshaya Tritiya", "અક્ષય તૃતીયા"),
    "Vaishakha",
    "shukla",
    3,
    { window: "madhyahna", tieBreak: "max-coverage" },
  ),
  tithi("nag-panchami", names("Nag Panchami", "નાગ પંચમી"), "Shravana", "shukla", 5),
  tithi(
    "sharad-purnima",
    names("Sharad Purnima", "શરદ પૂર્ણિમા"),
    "Ashvin",
    "shukla",
    15,
  ),
  tithi(
    // Civil date only: the full Vaishnava Ekadashi-dating convention (Hari-vasara, the
    // para/smarta split) isn't modelled — same class of simplification as Janmashtami's
    // variants, flagged in ADR 0027 rather than silently picked.
    "dev-uthani-ekadashi",
    names("Dev Uthani Ekadashi", "દેવ ઉઠી અગિયારસ"),
    "Kartika",
    "shukla",
    11,
  ),
  tithi("tulsi-vivah", names("Tulsi Vivah", "તુલસી વિવાહ"), "Kartika", "shukla", 12, {
    window: "pradosh",
    tieBreak: "max-coverage",
  }),
  tithi("rath-yatra", names("Rath Yatra", "રથયાત્રા"), "Ashadha", "shukla", 2),
  tithi(
    // North India/Gujarat convention (Chaitra Purnima). Maharashtra, Tamil Nadu/Kerala and
    // Karnataka/Andhra use different dates entirely — not modelled (ADR 0027).
    "hanuman-jayanti",
    names("Hanuman Jayanti", "હનુમાન જયંતી"),
    "Chaitra",
    "shukla",
    15,
  ),
  tithi(
    "chaitra-navratri",
    names("Chaitra Navratri", "ચૈત્ર નવરાત્રી"),
    "Chaitra",
    "shukla",
    1,
    { span: { end: { paksha: "shukla", tithi: 9 } } },
  ),
  tithi(
    // Same tithi as Holika Dahan (Phalguna Purnima) but no Bhadra-avoidance: Chaitanya
    // Mahaprabhu's appearance is dated by moonrise/evening, not Bhadra.
    "gaura-purnima",
    names("Gaura Purnima", "ગૌર પૂર્ણિમા"),
    "Phalguna",
    "shukla",
    15,
    { window: "pradosh", tieBreak: "max-coverage" },
  ),
  tithi(
    "nrisimha-chaturdashi",
    names("Nrisimha Chaturdashi", "નૃસિંહ ચતુર્દશી"),
    "Vaishakha",
    "shukla",
    14,
    { window: "pradosh", tieBreak: "max-coverage" },
  ),
  tithi(
    "radhashtami",
    names("Radhashtami", "રાધાષ્ટમી"),
    "Bhadrapada",
    "shukla",
    8,
    { window: "madhyahna", tieBreak: "max-coverage" },
  ),
  tithi(
    "jhulan-yatra",
    names("Jhulan Yatra", "ઝૂલન યાત્રા"),
    "Shravana",
    "shukla",
    11,
    { span: { end: { paksha: "shukla", tithi: 15 } } },
  ),
  tithi(
    // Same tithi as Bestu Varas (Kartika Shukla 1) but shipped as its own rule, not a
    // variant or renamed label: a conceptually different festival (Krishna lifting
    // Govardhan vs. the Gujarati new year) that always happens to share a tithi — the same
    // pattern already handled for Dhanteras/Kali Chaudas coinciding in some years.
    "govardhan-puja",
    names("Govardhan Puja", "ગોવર્ધન પૂજા"),
    "Kartika",
    "shukla",
    1,
  ),
];
