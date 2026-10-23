/** Returned by every parse function instead of a branded value (ADR 0014). */
export type ParseError = {
  readonly kind: "parse-error";
  readonly message: string;
};

export function parseError(message: string): ParseError {
  return { kind: "parse-error", message };
}

export function isParseError(value: unknown): value is ParseError {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as ParseError).kind === "parse-error"
  );
}
