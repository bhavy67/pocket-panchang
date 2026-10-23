const GU_DIGITS = "૦૧૨૩૪૫૬૭૮૯";

/** Latin digits → Gujarati digits (brief §9 Q4: provisional until family testers answer). */
export const guDigits = (s: string) =>
  s.replace(/\d/g, (d) => GU_DIGITS[Number(d)]!);
