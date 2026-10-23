// DOM tests run in jsdom with an in-memory IndexedDB (Dexie) and no real Worker.
import "fake-indexeddb/auto";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll } from "vitest";
import { loadLanguage } from "@/i18n";

beforeAll(() => loadLanguage("en"));

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
