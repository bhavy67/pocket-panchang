// DOM tests run in jsdom with an in-memory IndexedDB (Dexie) and no real Worker.
import "fake-indexeddb/auto";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);
