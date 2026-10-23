/** Unverified festival rules are dev-only (§0 rule 7); the E2E build opts in explicitly. */
export const SHOW_UNVERIFIED =
  import.meta.env.DEV || import.meta.env.VITE_SHOW_UNVERIFIED === "1";
