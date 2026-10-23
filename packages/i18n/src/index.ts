// Display names for panchang elements (GLOSSARY "Gujarati display terms"). Code and data use
// canonical names; these tables turn them into UI text. Gujarati strings are DRAFTS pending a
// native reader's review (brief §2). Full UI-string catalogues arrive in Phase 10.
import type { LunarMonth } from "@panchang/engine";

export type DisplayLang = "en" | "gu";

const GU_DIGITS = "૦૧૨૩૪૫૬૭૮૯";
/** Latin digits → Gujarati digits (brief §9 Q4: provisional until family testers answer). */
export const guDigits = (s: string) =>
  s.replace(/\d/g, (d) => GU_DIGITS[Number(d)]!);
const num = (n: number, lang: DisplayLang) =>
  lang === "gu" ? guDigits(String(n)) : String(n);

const MONTHS: Record<LunarMonth, [en: string, gu: string]> = {
  Chaitra: ["Chaitra", "ચૈત્ર"],
  Vaishakha: ["Vaishakh", "વૈશાખ"],
  Jyeshtha: ["Jeth", "જેઠ"],
  Ashadha: ["Ashadh", "અષાઢ"],
  Shravana: ["Shravan", "શ્રાવણ"],
  Bhadrapada: ["Bhadarvo", "ભાદરવો"],
  Ashvin: ["Aaso", "આસો"],
  Kartika: ["Kartak", "કારતક"],
  Margashirsha: ["Magshar", "માગશર"],
  Pausha: ["Posh", "પોષ"],
  Magha: ["Maha", "મહા"],
  Phalguna: ["Fagan", "ફાગણ"],
};

/** Gujarati display month, e.g. "Aaso"; "Adhik Shravan" for an extra month. */
export function monthName(
  month: LunarMonth,
  lang: DisplayLang,
  adhik = false,
): string {
  const name = MONTHS[month][lang === "gu" ? 1 : 0];
  return adhik ? `${lang === "gu" ? "અધિક" : "Adhik"} ${name}` : name;
}

/** Tithi 1–30 as "Sud 11" / "Vad 5" / "Sud Punam" / "Vad Amas". */
export function tithiLabel(tithi: number, lang: DisplayLang): string {
  const shukla = tithi <= 15;
  const n = shukla ? tithi : tithi - 15;
  const paksha = shukla ? ["Sud", "સુદ"] : ["Vad", "વદ"];
  const day =
    n === 15
      ? shukla
        ? ["Punam", "પૂનમ"]
        : ["Amas", "અમાસ"]
      : [num(n, "en"), num(n, "gu")];
  const i = lang === "gu" ? 1 : 0;
  return `${paksha[i]} ${day[i]}`;
}

const NAKSHATRAS = [
  ["Ashwini", "અશ્વિની"],
  ["Bharani", "ભરણી"],
  ["Krittika", "કૃત્તિકા"],
  ["Rohini", "રોહિણી"],
  ["Mrigashira", "મૃગશીર્ષ"],
  ["Ardra", "આર્દ્રા"],
  ["Punarvasu", "પુનર્વસુ"],
  ["Pushya", "પુષ્ય"],
  ["Ashlesha", "આશ્લેષા"],
  ["Magha", "મઘા"],
  ["Purva Phalguni", "પૂર્વા ફાલ્ગુની"],
  ["Uttara Phalguni", "ઉત્તરા ફાલ્ગુની"],
  ["Hasta", "હસ્ત"],
  ["Chitra", "ચિત્રા"],
  ["Swati", "સ્વાતિ"],
  ["Vishakha", "વિશાખા"],
  ["Anuradha", "અનુરાધા"],
  ["Jyeshtha", "જ્યેષ્ઠા"],
  ["Mula", "મૂળ"],
  ["Purva Ashadha", "પૂર્વાષાઢા"],
  ["Uttara Ashadha", "ઉત્તરાષાઢા"],
  ["Shravana", "શ્રવણ"],
  ["Dhanishta", "ધનિષ્ઠા"],
  ["Shatabhisha", "શતભિષા"],
  ["Purva Bhadrapada", "પૂર્વા ભાદ્રપદ"],
  ["Uttara Bhadrapada", "ઉત્તરા ભાદ્રપદ"],
  ["Revati", "રેવતી"],
] as const;

const YOGAS = [
  ["Vishkambha", "વિષ્કંભ"],
  ["Priti", "પ્રીતિ"],
  ["Ayushman", "આયુષ્માન"],
  ["Saubhagya", "સૌભાગ્ય"],
  ["Shobhana", "શોભન"],
  ["Atiganda", "અતિગંડ"],
  ["Sukarma", "સુકર્મા"],
  ["Dhriti", "ધૃતિ"],
  ["Shula", "શૂળ"],
  ["Ganda", "ગંડ"],
  ["Vriddhi", "વૃદ્ધિ"],
  ["Dhruva", "ધ્રુવ"],
  ["Vyaghata", "વ્યાઘાત"],
  ["Harshana", "હર્ષણ"],
  ["Vajra", "વજ્ર"],
  ["Siddhi", "સિદ્ધિ"],
  ["Vyatipata", "વ્યતિપાત"],
  ["Variyan", "વરીયાન"],
  ["Parigha", "પરિઘ"],
  ["Shiva", "શિવ"],
  ["Siddha", "સિદ્ધ"],
  ["Sadhya", "સાધ્ય"],
  ["Shubha", "શુભ"],
  ["Shukla", "શુક્લ"],
  ["Brahma", "બ્રહ્મ"],
  ["Indra", "ઇન્દ્ર"],
  ["Vaidhriti", "વૈધૃતિ"],
] as const;

/** Nakshatra 1–27. */
export const nakshatraName = (i: number, lang: DisplayLang) =>
  NAKSHATRAS[i - 1]![lang === "gu" ? 1 : 0];

/** Yoga 1–27. */
export const yogaName = (i: number, lang: DisplayLang) =>
  YOGAS[i - 1]![lang === "gu" ? 1 : 0];

const WEEKDAYS = [
  ["Sunday", "રવિવાર"],
  ["Monday", "સોમવાર"],
  ["Tuesday", "મંગળવાર"],
  ["Wednesday", "બુધવાર"],
  ["Thursday", "ગુરુવાર"],
  ["Friday", "શુક્રવાર"],
  ["Saturday", "શનિવાર"],
] as const;

/** Vara 0–6, 0 = Sunday. */
export const weekdayName = (vara: number, lang: DisplayLang) =>
  WEEKDAYS[vara]![lang === "gu" ? 1 : 0];
