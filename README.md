# Pocket Panchang

A beautiful, private, offline Hindu panchang that's Gujarati-first and diaspora-aware, built around **personal tithi reminders**: family birthdays, varsi/shraddh, and anniversaries that follow the lunar calendar.

> **Status:** Phase 3 (monorepo scaffolding). The app renders an empty shell. See [`PROJECT_PLAN.md`](./PROJECT_PLAN.md) for scope, architecture, and the phase plan.

## Development

Requires Node 24 and pnpm 11.

```sh
pnpm install
pnpm --filter @panchang/app dev   # dev server
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

## Principles

- **Private:** no account, no server, no analytics, no ads.
- **Offline:** PWA and Android (Capacitor).
- **Measured accuracy:** a CI accuracy report against reference data (published here once the engine exists).

## Docs

- [Project plan](./PROJECT_PLAN.md)
- [Architecture decisions](./docs/adr/)

## License

TBD.
