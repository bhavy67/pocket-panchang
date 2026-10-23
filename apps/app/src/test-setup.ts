// DOM tests run in jsdom with an in-memory IndexedDB (Dexie) and no real Worker.
import "fake-indexeddb/auto";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);

// jsdom has no matchMedia: report a phone-sized, light-mode screen.
if (typeof window.matchMedia !== "function")
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }) as unknown as MediaQueryList;
