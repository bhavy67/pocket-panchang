# Web release: panchang.bhavyladani.in

Hosting: Vercel project **`panchang`** (team "Bhavy's projects"), Git-connected to `bhavy67/pocket-panchang`, root directory `apps/app`, Node 24. Every push to `main` deploys to production; pull requests get preview URLs. Build settings live in `apps/app/vercel.json` (`pnpm build` → `dist`, SPA rewrites, long-lived cache for hashed assets, `sw.js` never cached).

## DNS (one step, in Cloudflare)

bhavyladani.in uses Cloudflare nameservers. The domain is already added to the Vercel project (verified, waiting for DNS). In Cloudflare → bhavyladani.in → DNS → Records → Add record:

| Type | Name | Target | Proxy status | TTL |
|---|---|---|---|---|
| CNAME | `panchang` | `8ebf3dba2ac960a4.vercel-dns-017.com` | **DNS only** (grey cloud) | Auto |

Proxy must be off: with Cloudflare's orange-cloud proxy, Vercel cannot issue or renew the certificate. (Vercel also accepts the generic `cname.vercel-dns.com`; the project-specific target above is its first recommendation.) Vercel issues HTTPS once the record resolves, usually within minutes. Check: `dig +short panchang.bhavyladani.in` returns Vercel addresses, and Vercel → panchang → Settings → Domains shows "Valid Configuration".

## Release

1. Merge to `main` (CI green: typecheck, lint, format, unit tests, E2E).
2. Vercel builds and promotes automatically. Verify `https://panchang.bhavyladani.in/` loads, `/privacy` and `/how` open directly, and an offline reload works after the first visit.
3. Family preview users: the preview's banner asks them to export a backup and restore it here (data is per web address, ADR 0013).

Unverified festivals stay hidden: production builds never set `VITE_SHOW_UNVERIFIED`.
