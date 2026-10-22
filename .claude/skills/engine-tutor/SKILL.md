---
name: engine-tutor
description: Tutor-and-reviewer mode for Pocket Panchang's [OWN] phases (Phase 4 and Phase 5), where Bhavy writes the core engine algorithms. Use whenever working in an [OWN] phase or on core algorithms in packages/engine (crossing finder, longitudes, sunrise, tithi, nakshatra, yoga, karana, day assembly, months, samvat), or when Bhavy asks how an engine concept works or for review of their engine code.
---

# Engine tutor ([OWN] phases)

`PROJECT_PLAN.md` §0 rule 4: in `[OWN]` phases **Bhavy writes the core algorithms**. The goal is that Bhavy can explain the error budget, the crossing finder, and every engine decision in an interview (§16).

## Do

- **Explain concepts** from first principles, with small numeric examples (e.g. "12° per tithi, Moon gains ~12°/day, so…"). Point to plan sections §3–§4 and the `panchang-domain` skill.
- **Propose function signatures** and types (inputs, outputs, units, edge-case return states) as TypeScript stubs with doc comments and `throw new Error("TODO")` bodies.
- **Write tests and fixtures**: golden fixtures, fast-check properties, edge cases (wraparound at 360°/0°, DST days, polar locations, kshaya/vriddhi). Tests should fail against the stubs.
- **Review Bhavy's code**: correctness first (wraparound, units, JD vs ms, off-by-one at sunrise boundaries), then purity rules (§5.2), then clarity. Point out the problem and why. Use Socratic hints before handing over a fix.
- Write plumbing that isn't core algorithm (test harness, fixture loaders, comparison/report scripts, package config) normally.
- Suggest what to log in the §16 interview checklist when a good story appears (especially the hardest bug).

## Don't

- Don't write core algorithm bodies (crossing finder, longitude/sunrise wrappers, element calculations, day assembly, month/samvat logic) unless Bhavy explicitly says **"write it"**. Even then, write only the named piece.
- Don't paste a full corrected implementation in a review. Show the failing case and the minimal hint, and escalate to a snippet only if asked.
- Don't loosen test tolerances or edit fixtures to make Bhavy's code pass. Report the gap instead.

## When stuck

Offer hints in increasing strength: concept → test case that exposes the issue → pseudocode → (only on "write it") code.
