// Display names for panchang elements (GLOSSARY "Gujarati display terms"). Code and data use
// canonical names; these tables turn them into UI text. Gujarati strings are DRAFTS pending a
// native reader's review (docs/i18n/gu-review.md). UI strings live in messages/{en,gu}.ts.
import type { LunarMonth } from "@panchang/engine";
import { guDigits } from "./digits";

export type DisplayLang = "en" | "gu";

export { guDigits } from "./digits";
export { interpolate } from "./interpolate";
export type { MessageKey, Messages } from "./messages/en";
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

const CHOGHADIYA: Record<string, string> = {
  Amrut: "અમૃત",
  Shubh: "શુભ",
  Labh: "લાભ",
  Char: "ચલ",
  Udveg: "ઉદ્વેગ",
  Kaal: "કાળ",
  Rog: "રોગ",
};

/** Choghadiya name (calendar's canonical "Amrut" … "Rog"). */
export const choghadiyaName = (name: string, lang: DisplayLang) =>
  lang === "gu" ? (CHOGHADIYA[name] ?? name) : name;

const KARANAS: Record<string, string> = {
  Bava: "બવ",
  Balava: "બાલવ",
  Kaulava: "કૌલવ",
  Taitila: "તૈતિલ",
  Garaja: "ગર",
  Vanija: "વણિજ",
  Vishti: "વિષ્ટિ",
  Kimstughna: "કિંસ્તુઘ્ન",
  Shakuni: "શકુનિ",
  Chatushpada: "ચતુષ્પાદ",
  Naga: "નાગ",
};

/** Karana name (engine's canonical "Bava" … "Naga"). */
export const karanaDisplay = (name: string, lang: DisplayLang) =>
  lang === "gu" ? (KARANAS[name] ?? name) : name;

const TITHI_NAMES = [
  ["Ekam", "એકમ"],
  ["Bij", "બીજ"],
  ["Trij", "ત્રીજ"],
  ["Choth", "ચોથ"],
  ["Pancham", "પાંચમ"],
  ["Chhath", "છઠ"],
  ["Satam", "સાતમ"],
  ["Atham", "આઠમ"],
  ["Nom", "નોમ"],
  ["Dasham", "દશમ"],
  ["Agiyaras", "અગિયારસ"],
  ["Baras", "બારસ"],
  ["Teras", "તેરસ"],
  ["Chaudas", "ચૌદસ"],
] as const;

/** Everyday Gujarati name of tithi 1–30: "Agiyaras", "Punam", "Amas". */
export function tithiName(tithi: number, lang: DisplayLang): string {
  const n = tithi <= 15 ? tithi : tithi - 15;
  if (n === 15)
    return tithi === 15
      ? lang === "gu"
        ? "પૂનમ"
        : "Punam"
      : lang === "gu"
        ? "અમાસ"
        : "Amas";
  return TITHI_NAMES[n - 1]![lang === "gu" ? 1 : 0];
}
