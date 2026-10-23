// Fixture cities (§10). Coordinates here only drive day *selection*; accuracy tests use the
// reference's own coordinates recorded in each fixture file.
export const CITIES = [
  {
    key: "ahmedabad",
    name: "Ahmedabad",
    geonameId: 1279233,
    tz: "Asia/Kolkata",
    latitude: 23.02579,
    longitude: 72.58727,
  },
  {
    key: "delhi",
    name: "Delhi",
    geonameId: 1273294,
    tz: "Asia/Kolkata",
    latitude: 28.65195,
    longitude: 77.23149,
  },
  {
    key: "chennai",
    name: "Chennai",
    geonameId: 1264527,
    tz: "Asia/Kolkata",
    latitude: 13.08784,
    longitude: 80.27847,
  },
  {
    key: "new-york",
    name: "New York",
    geonameId: 5128581,
    tz: "America/New_York",
    latitude: 40.71427,
    longitude: -74.00597,
  },
  {
    key: "london",
    name: "London",
    geonameId: 2643743,
    tz: "Europe/London",
    latitude: 51.50853,
    longitude: -0.12574,
  },
] as const;

export const DST_DAYS: Record<string, Record<number, string[]>> = {
  "new-york": {
    2026: ["2026-03-08", "2026-11-01"],
    2027: ["2027-03-14", "2027-11-07"],
  },
  london: {
    2026: ["2026-03-29", "2026-10-25"],
    2027: ["2027-03-28", "2027-10-31"],
  },
};
