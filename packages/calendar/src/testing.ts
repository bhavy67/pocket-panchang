// Test/tool-only helpers: an Intl-backed CivilClock (the app will provide the real one).
import { parseCivilDate, type CivilDate, type Instant } from "@panchang/engine";
import type { CivilClock, Location, LocationId } from "./types";

function offsetMinutes(ms: number, timeZone: string): number {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  })
    .formatToParts(new Date(ms))
    .find((p) => p.type === "timeZoneName")!.value;
  const m = /GMT([+-])(\d{2}):(\d{2})/.exec(name);
  return m ? (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 0;
}

export function clockFor(tz: string): CivilClock {
  return {
    localMidnight(date) {
      const utc = Date.parse(`${date}T00:00:00Z`);
      const guess = utc - offsetMinutes(utc, tz) * 60_000;
      return (utc - offsetMinutes(guess, tz) * 60_000) as Instant;
    },
    localDate(instant) {
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(instant)) as CivilDate;
    },
  };
}

export const date = (s: string): CivilDate => {
  const d = parseCivilDate(s);
  if (typeof d !== "string") throw new Error(d.message);
  return d;
};

export const AHMEDABAD: Location = {
  id: "1279233" as LocationId,
  name: "Ahmedabad",
  lat: 23.025556,
  lng: 72.587222,
  tz: "Asia/Kolkata",
  country: "IN",
};
export const NEW_YORK: Location = {
  id: "5128581" as LocationId,
  name: "New York",
  lat: 40.71427,
  lng: -74.00597,
  tz: "America/New_York",
  country: "US",
};
export const DELHI: Location = {
  id: "1273294" as LocationId,
  name: "Delhi",
  lat: 28.65195,
  lng: 77.23149,
  tz: "Asia/Kolkata",
  country: "IN",
};
export const CHENNAI: Location = {
  id: "1264527" as LocationId,
  name: "Chennai",
  lat: 13.08784,
  lng: 80.27847,
  tz: "Asia/Kolkata",
  country: "IN",
};
export const LONDON: Location = {
  id: "2643743" as LocationId,
  name: "London",
  lat: 51.50853,
  lng: -0.12574,
  tz: "Europe/London",
  country: "GB",
};
export const CITIES = [AHMEDABAD, DELHI, CHENNAI, NEW_YORK, LONDON] as const;

export const place = (l: Location) => ({
  coordinates: { latitude: l.lat, longitude: l.lng },
  clock: clockFor(l.tz),
});
