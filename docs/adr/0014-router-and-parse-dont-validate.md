---
status: accepted
date: 2026-10-22
---

# 0014. TanStack Router (code-based) and "parse, don't validate" domain types (§13 #6)

The app uses **TanStack Router with code-based routes** (no file-based codegen step). The selected date, viewed month, and city live in the URL so mismatch reports, bookmarks, and back/forward reproduce what the user saw. TanStack Router types and validates search params at the route, so a malformed `?date=` is rejected before any component sees it; it also pairs naturally with TanStack Query loaders for month prefetch. React Router was the familiar alternative, but its untyped search params would leave validation to each screen, and a wrong date is a critical bug (§0 rule 7).

## Parse, don't validate

Router validation only protects the URL boundary. Inputs also arrive from JSON backup import, notification payloads, and user forms. So:

- Domain inputs are **branded types** (e.g., `CivilDate`, `LocationId`) that can be produced **only by parse functions** (`parseCivilDate(input): CivilDate | ParseError`, etc.). There is no other way to construct them.
- **Engine and calendar APIs accept only branded types**, never raw strings or numbers for these concepts.
- Every input boundary (router search params, backup import, notification payloads, forms) calls the parse function; downstream code never re-validates.
- `LocationId` parsing covers both bundled-city ids and custom-location ids (`custom:<lat>,<lng>`, ADR 0011).

Further branded types (e.g., for UTC instants or Julian Days in the engine) are proposed and confirmed when the engine API is designed in Phase 4, not added silently.

## Consequences

- Phase 3 sets up TanStack Router with code-based routes; Phase 7 defines the parse functions alongside the first boundaries (router, Dexie, backup import).
- Required tests: each parse function rejects malformed input (bad dates such as `2026-02-30`, unknown or malformed location ids) and round-trips valid input.
