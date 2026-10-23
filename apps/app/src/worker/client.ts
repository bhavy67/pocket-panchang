// The main thread's handle on the worker. Vite bundles worker.ts as a separate chunk (§7 lazy-load).
import { wrap } from "comlink";
import type { Api } from "./api";

export const worker = wrap<Api>(
  new Worker(new URL("./worker.ts", import.meta.url), { type: "module" }),
);
