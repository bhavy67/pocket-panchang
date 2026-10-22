# Pocket Panchang

The language of the Hindu lunisolar calendar as this app uses it: the daily panchang, lunar months and years, festivals, muhurta, and personal events observed by tithi.

## Day and its elements

**Panchang**:
The five daily elements (tithi, nakshatra, yoga, karana, vara) plus sunrise/sunset and month/year for one civil day at one location.

**Civil day**:
The Hindu day for a location, running from one local sunrise to the next.
_Avoid_: Calendar day, date (when the sunrise-to-sunrise span is meant)

**Tithi**:
A lunar day; one of 30 per lunation, each spanning 12° of Moon–Sun separation.
_Avoid_: Lunar date, tithi number (when the named tithi is meant)

**Udaya tithi**:
The tithi prevailing at local sunrise; it names the civil day.

**Vriddhi tithi**:
A tithi prevailing at two consecutive sunrises, so it names two civil days. Unrelated to the yoga named Vriddhi.
_Avoid_: Vriddhi (alone), adhik tithi, repeated tithi

**Kshaya tithi**:
A tithi that begins and ends between two sunrises, so it names no civil day.
_Avoid_: Skipped tithi, lost tithi

**Paksha**:
A lunar fortnight: Shukla (waxing, tithis 1–15) or Krishna (waning, tithis 16–30).
_Avoid_: Bright half, dark half

**Nakshatra**:
One of 27 lunar mansions, each 13°20′ of the sidereal zodiac, occupied by the Moon.

**Yoga**:
One of 27 divisions defined by the combined sidereal longitudes of the Sun and Moon. One of them is named **Vriddhi**; always say "Vriddhi yoga" for it, never bare "Vriddhi".

**Karana**:
A half-tithi; 60 per lunation, drawn from 11 names (7 movable, 4 fixed).

**Vara**:
The weekday of a civil day.

## Months and years

**Lunar month**:
The span between two consecutive new moons (Amanta frame), named after the sankranti it contains.
_Avoid_: Masa (except inside compound terms), month (unqualified, when a Gregorian month could be meant)

**Amanta**:
The convention in which a lunar month ends at Amavasya (new moon). The app's internal frame; Gujarati default.

**Purnimanta**:
The convention in which a lunar month ends at Purnima (full moon); Krishna-paksha days carry the next month's name.

**Sankranti**:
The Sun's entry into a new sidereal rashi (30° sign).

**Adhik masa**:
A lunar month containing no sankranti; an extra month named after the month that follows it.
_Avoid_: Purushottam masa, mal masa (synonyms; use only as display labels)

**Nija masa**:
The regular month that follows an adhik masa of the same name.

**Kshaya masa**:
A lunar month containing two sankrantis; a rare dropped month.

**Vikram Samvat**:
The Vikram era year. Kartikadi (Gujarati default) begins at Kartik Shukla Pratipada; Chaitradi begins at Chaitra Shukla Pratipada.

**Shaka Samvat**:
The Shaka era year, beginning at Chaitra Shukla Pratipada.

**Ayanamsa**:
The offset between the tropical and sidereal zodiacs. This app uses Lahiri.

## Gujarati display terms

Canonical terms are the Sanskrit names below. Gujarati-mode UI copy uses the Gujarati terms; code, data, and docs use the canonical ones.

| Canonical | Gujarati display |
|---|---|
| Shukla paksha | Sud |
| Krishna paksha | Vad |
| Kartika | Kartak |
| Margashirsha | Magshar |
| Pausha | Posh |
| Magha | Maha |
| Phalguna | Fagan |
| Chaitra | Chaitra |
| Vaishakha | Vaishakh |
| Jyeshtha | Jeth |
| Ashadha | Ashadh |
| Shravana | Shravan |
| Bhadrapada | Bhadarvo |
| Ashvin | Aaso |

## Muhurta

**Muhurta**:
A time period within a civil day rated auspicious or inauspicious.

**Rahu Kaal / Yamaganda / Gulika**:
Inauspicious daytime periods, each one-eighth of daylight, chosen by weekday.

**Choghadiya**:
One of eight equal periods of daytime or nighttime, each named Amrut, Shubh, Labh, Char, Udveg, Kaal, or Rog.

## Festivals

**Festival**:
A named public observance, fixed by a tithi (with an observance window), a sankranti, or an offset from another festival.

**Bhadra**:
The period of the Vishti karana, considered inauspicious for starting some observances (e.g., tying rakhi, Holika Dahan).
_Avoid_: Vishti (except as the karana's name)

**Festival span**:
A festival lasting several consecutive civil days, from a start tithi to an end tithi (e.g., Navratri); its length in days varies by year.

**Observance window**:
The part of the day a festival's tithi must cover: sunrise, madhyahna (midday), aparahna (afternoon), pradosh (dusk), or nishita (midnight).

**Purva-vyapini / Para-vyapini**:
Classical tie-break rules choosing the earlier or later day when a tithi covers the observance window on two days.

## Personal events

**Personal event**:
A user's recurring observance tied to a lunar date: janma tithi (birthday), shraddh/varsi, anniversary, or custom.

**Occurrence**:
The Gregorian civil day on which a personal event is observed in a given year.

**Shraddh**:
A personal event observing a relative's death tithi.
_Avoid_: Death anniversary, varsi (Gujarati display term for the annual shraddh)

**Annual occurrence**:
A shraddh's occurrence on its own lunar date each year.

**Pitru Paksha**:
Bhadrapada Krishna paksha (Amanta), ending at Sarva Pitru Amavasya, when ancestors are honored by tithi.
_Avoid_: Shraddh paksha, Mahalaya paksha

**Pitru Paksha occurrence**:
A shraddh's occurrence on its chosen Pitru Paksha day (by default the same tithi number as the death tithi).

**Occurrence policy**:
The rules choosing an occurrence when the lunar date is ambiguous (observance window, adhik masa, kshaya and vriddhi tithi, Pitru Paksha).

**Origin**:
The Gregorian date, optional time, and place where a birth or death actually happened; reference only, never the source of truth for the lunar date.
_Avoid_: Birth place, event location (ambiguous with observance location)

**Observance location**:
The city whose sunrise determines a personal event's occurrence; by default the household's observance city.
_Avoid_: Event location, home city

**Viewing city**:
The city whose panchang the user is currently looking at.
_Avoid_: Current location (when the observance location is meant)

**Family convention**:
A household-wide occurrence-policy default for one event kind, which applies to every event of that kind unless the event overrides it.
_Avoid_: Global setting, household policy (in UI copy)
