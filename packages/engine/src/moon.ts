import { Body, Observer, SearchAltitude } from "astronomy-engine";
import type { Coordinates, SunEvent } from "./sun";
import { fromAstroTime, toAstroTime, type Instant } from "./time";

/**
 * Moonrise / moonset (ADR 0022): the topocentric centre of the Moon at 0° geometric altitude,
 * no refraction. This matched Drik Panchang to the rounded minute (Ahmedabad, 22 Oct 2026);
 * upper limb + refraction ran ~4 min early. Display only; no panchang element depends on it.
 */
export type MoonEvent = SunEvent;

/** Moonrise and moonset can be missing on a given day: search a little over one lunar day. */
const SEARCH_DAYS = 1.1;

function search(direction: 1 | -1, after: Instant, at: Coordinates): MoonEvent {
  const found = SearchAltitude(
    Body.Moon,
    new Observer(at.latitude, at.longitude, 0),
    direction,
    toAstroTime((after + 1) as Instant),
    SEARCH_DAYS,
    0,
  );
  return found
    ? { kind: "event", at: fromAstroTime(found) }
    : { kind: "none", sunUp: false };
}

/** First moonrise after `after`, within ~26 h. */
export const nextMoonrise = (after: Instant, at: Coordinates) =>
  search(+1, after, at);

/** First moonset after `after`, within ~26 h. */
export const nextMoonset = (after: Instant, at: Coordinates) =>
  search(-1, after, at);
