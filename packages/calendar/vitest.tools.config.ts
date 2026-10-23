import { defineConfig } from "vitest/config";

// On-demand tools (not part of `pnpm test`).
export default defineConfig({ test: { include: ["tools/**/*.tool.ts"] } });
