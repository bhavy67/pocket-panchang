# Web release: panchang.bhavyladani.in

Hosting: Vercel project **`panchang`** (team "Bhavy's projects"), Git-connected to `bhavy67/pocket-panchang`, root directory `apps/app`, Node 24. Pushes to `main` build "production" deployments, but **automatic custom-domain assignment is off** (`autoAssignCustomDomains: false`, set 2026-10-24), so nothing reaches panchang.bhavyladani.in until it is promoted at release finalization (after the Phase 11.5 UI revamp). Builds are reachable only at `*.vercel.app` URLs behind Vercel login. Build settings live in `apps/app/vercel.json` (`pnpm build` → `dist`, SPA rewrites, long-lived cache for hashed assets, `sw.js` never cached).

## DNS (at release finalization, in Cloudflare)

bhavyladani.in uses Cloudflare nameservers. The domain is already added to the Vercel project (verified, waiting for DNS). In Cloudflare → bhavyladani.in → DNS → Records → Add record:

| Type | Name | Target | Proxy status | TTL |
|---|---|---|---|---|
| CNAME | `panchang` | `8ebf3dba2ac960a4.vercel-dns-017.com` | **DNS only** (grey cloud) | Auto |

Proxy must be off: with Cloudflare's orange-cloud proxy, Vercel cannot issue or renew the certificate. (Vercel also accepts the generic `cname.vercel-dns.com`; the project-specific target above is its first recommendation.) Vercel issues HTTPS once the record resolves, usually within minutes. Check: `dig +short panchang.bhavyladani.in` returns Vercel addresses, and Vercel → panchang → Settings → Domains shows "Valid Configuration".

## Release finalization (after Phase 11.5)

1. Merge the revamp to `main` with CI green (typecheck, lint, format, unit tests, E2E).
2. Add the DNS record above and wait for Vercel → panchang → Settings → Domains to show "Valid Configuration".
3. Promote: Vercel → panchang → Deployments → the latest `main` deployment → **Promote to Production** (or re-enable "Auto-assign custom domains" in Settings → Git if every `main` push should go live from then on).
4. Verify `https://panchang.bhavyladani.in/` loads, `/privacy` and `/how` open directly, and an offline reload works after the first visit.
5. Family preview users: the preview's banner asks them to export a backup and restore it here (data is per web address, ADR 0013).

Unverified festivals stay hidden: production builds never set `VITE_SHOW_UNVERIFIED`.
