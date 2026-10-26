# Gujarati strings: native review checklist

**Every Gujarati string is a draft** until a native reader ticks it here. Mark a row `[x]` when it reads naturally to an older Gujarati reader, or write the better wording beside it and leave it unticked. Generated from `packages/i18n` and the festival table by `apps/app/src/gu-review.test.ts`; regenerating keeps ticks.

## Open questions for the reviewer (brief §9)

- [ ] **Digits:** Gujarati digits everywhere in Gujarati mode (૧૧, ૨:૪૭). Keep, or Latin digits (11, 2:47)?
- [ ] **Clock:** 12-hour, with the time-of-day word after the time as the browser writes it: "૨:૪૭ બપોરે". Would "બપોરે ૨:૪૭" read better? Are સવારે / બપોરે / સાંજે / રાત્રે the right words and boundaries?
- [ ] **Dates:** "ગુરુ, ૨૨ ઑક્ટો" and "ગુરુવાર, ૨૨ ઑક્ટોબર, ૨૦૨૬" (the browser's Gujarati month names).
- [ ] **Palette names:** શાંત / મંદિર / રાત; does "મંદિર" read as sect-specific?
- [ ] **Tone:** warm, plain and respectful, like a helpful family member; no fear words around Rahu Kaal.
- [ ] **Month-grid markers:** "૨×" (two-day tithi) and "છૂટી" (skipped tithi).
- [ ] **Event kinds:** વરસી / શ્રાદ્ધ, લગ્નતિથિ, જન્મદિવસ (તિથિ મુજબ).

### UI strings (426)

| OK | Key | English | ગુજરાતી (draft) |
|---|---|---|---|
| [ ] | `navToday` | Today | આજે |
| [ ] | `navMonth` | Month | મહિનો |
| [ ] | `navEvents` | Family | પરિવાર |
| [ ] | `navSettings` | Settings | સેટિંગ્સ |
| [ ] | `navMain` | Main | મુખ્ય |
| [ ] | `close` | Close | બંધ કરો |
| [ ] | `previewTitle` | Family preview. | પરિવાર માટે પૂર્વાવલોકન. |
| [ ] | `previewBody` | Before moving to the final app, save a backup in Settings → Backup and restore it there. | અંતિમ ઍપ પર જતાં પહેલાં સેટિંગ્સ → બૅકઅપમાં બૅકઅપ સાચવો અને ત્યાં પાછું લાવો. |
| [ ] | `previewLink` | Go to Backup | બૅકઅપ પર જાઓ |
| [ ] | `qBest` | Best time | ઉત્તમ સમય |
| [ ] | `qGood` | Good time | સારો સમય |
| [ ] | `qBad` | Not good | સારો નહીં |
| [ ] | `qNeutral` | Neutral | સામાન્ય |
| [ ] | `keyGood` | Good | સારો |
| [ ] | `keyNeutral` | Neutral | સામાન્ય |
| [ ] | `keyBad` | Not good | સારો નહીં |
| [ ] | `key` | Key | સંકેત |
| [ ] | `rahuKaal` | Rahu Kaal | રાહુ કાળ |
| [ ] | `yamaganda` | Yamaganda | યમઘંટ |
| [ ] | `gulika` | Gulika | ગુલિક |
| [ ] | `bhadra` | Bhadra | ભદ્રા |
| [ ] | `bhadraFull` | Bhadra (Vishti karana) | ભદ્રા (વિષ્ટિ કરણ) |
| [ ] | `choghadiya` | Choghadiya | ચોઘડિયાં |
| [ ] | `chogBody` | The day from sunrise to sunset is split into 8 equal parts called Choghadiya (the night into 8 more). Each part is traditionally seen as good, neutral or not good for starting something new. | સૂર્યોદયથી સૂર્યાસ્ત સુધીનો દિવસ ૮ સરખા ભાગમાં વહેંચાય છે, જેને ચોઘડિયાં કહે છે (રાત્રિના પણ ૮). પરંપરા મુજબ દરેક ભાગ નવું કામ શરૂ કરવા માટે સારો, સામાન્ય કે સારો નહીં ગણાય છે. |
| [ ] | `rahuBody` | A daily period of about 1½ hours. Many families avoid starting new work now. Its time changes each day with sunrise and sunset. | રોજનો આશરે દોઢ કલાકનો સમય. ઘણા પરિવારો આ સમયે નવું કામ શરૂ કરતા નથી. તેનો સમય રોજ સૂર્યોદય અને સૂર્યાસ્ત સાથે બદલાય છે. |
| [ ] | `softAvoidBody` | A daily period of about 1½ hours that some families avoid for new work. | રોજનો આશરે દોઢ કલાકનો સમય, જેમાં કેટલાક પરિવારો નવું કામ ટાળે છે. |
| [ ] | `bhadraBody` | Bhadra is the Vishti karana, one half of a tithi. Many families avoid auspicious work, such as ceremonies or starting something new, during it. | ભદ્રા એટલે વિષ્ટિ કરણ, તિથિનો અડધો ભાગ. ઘણા પરિવારો આ સમયે શુભ કામ, જેમ કે વિધિ કે નવી શરૂઆત, ટાળે છે. |
| [ ] | `chogKicker` | Choghadiya · {quality} | ચોઘડિયું · {quality} |
| [ ] | `chogRahuNote` | Rahu Kaal falls at the same time ({range}). Many families wait until it ends before starting new work. | આ જ સમયે રાહુ કાળ પણ છે ({range}). ઘણા પરિવારો નવું કામ શરૂ કરવા તે પૂરો થાય ત્યાં સુધી રાહ જુએ છે. |
| [ ] | `avoidKicker` | A time many avoid | ઘણા ટાળે તે સમય |
| [ ] | `avoidUntilBeforeSunrise` | Until {time} (started before sunrise) | {time} સુધી (સૂર્યોદય પહેલાં શરૂ થયું) |
| [ ] | `avoidFromAfterSunset` | From {time} (continues after sunset, until {end}) | {time} થી (સૂર્યાસ્ત પછી પણ, {end} સુધી) |
| [ ] | `avoidAria` | {name}, {from} until {end}, a time many families avoid | {name}, {from} {end} સુધી, ઘણા પરિવારો ટાળે તે સમય |
| [ ] | `fromBeforeSunrise` | from before sunrise | સૂર્યોદય પહેલાંથી |
| [ ] | `fromTime` | from {time} | {time} થી |
| [ ] | `timesManyAvoid` | Times many avoid | ઘણા ટાળે તે સમય |
| [ ] | `sunrise` | Sunrise | સૂર્યોદય |
| [ ] | `sunset` | Sunset | સૂર્યાસ્ત |
| [ ] | `moonrise` | Moonrise | ચંદ્રોદય |
| [ ] | `moonset` | Moonset | ચંદ્રાસ્ત |
| [ ] | `happeningNow` | , happening now | , અત્યારે ચાલુ |
| [ ] | `untilTime` | until {time} | {time} સુધી |
| [ ] | `now` | Now | હમણાં |
| [ ] | `showNight` | Show night Choghadiya | રાત્રિનાં ચોઘડિયાં બતાવો |
| [ ] | `hideNight` | Hide night Choghadiya | રાત્રિનાં ચોઘડિયાં છુપાવો |
| [ ] | `help` | Help | મદદ |
| [ ] | `todaysPanchang` | Today's panchang | આજનું પંચાંગ |
| [ ] | `hourByHour` | Today, hour by hour | આજે, કલાકે કલાકે |
| [ ] | `hourByHourSub` | Sunrise to sunset, split into 8 Choghadiya. Tap any part for details. | સૂર્યોદયથી સૂર્યાસ્ત, ૮ ચોઘડિયાંમાં. વિગત માટે કોઈ પણ ભાગ પર ટૅપ કરો. |
| [ ] | `sunAndMoon` | Sun and Moon | સૂર્ય અને ચંદ્ર |
| [ ] | `howCalculated` | How this is calculated | આ કેવી રીતે ગણાય છે |
| [ ] | `noCivilDayToday` | There is no sunrise or sunset here today, so the panchang can't be worked out. | આજે અહીં સૂર્યોદય કે સૂર્યાસ્ત નથી, તેથી પંચાંગ ગણી શકાતું નથી. |
| [ ] | `tithiUntilThen` | until {time}, then {next} | {time} સુધી, પછી {next} |
| [ ] | `tithiSince` | since {time} | {time} થી |
| [ ] | `allDay` | all day | આખો દિવસ |
| [ ] | `overlapOne` | {cur} is a good time, but {avoid} is also on, so many families wait to start new work. | {cur} સારો સમય છે, પણ {avoid} પણ ચાલુ છે, તેથી ઘણા પરિવારો નવું કામ શરૂ કરવા રાહ જુએ છે. |
| [ ] | `overlapMany` | {cur} is a good time, but {avoid} are also on, so many families wait to start new work. | {cur} સારો સમય છે, પણ {avoid} પણ ચાલુ છે, તેથી ઘણા પરિવારો નવું કામ શરૂ કરવા રાહ જુએ છે. |
| [ ] | `andJoin` |  and  |  અને  |
| [ ] | `endsAt` | {name} ends at {time} | {name} {time} એ પૂરો થાય છે |
| [ ] | `glanceAria` | {title}. {chog}Rahu Kaal {range}{now}. | {title}. {chog}રાહુ કાળ {range}{now}. |
| [ ] | `glanceChogAria` | Choghadiya: {name}, {quality}, until {time}.  | ચોઘડિયું: {name}, {quality}, {time} સુધી.  |
| [ ] | `chogLine` | Choghadiya: {name} | ચોઘડિયું: {name} |
| [ ] | `manyAvoidNow` | Many avoid now | અત્યારે ઘણા ટાળે છે |
| [ ] | `manyAvoidNowSub` | Families often wait to start new or auspicious work. | પરિવારો ઘણી વાર નવું કે શુભ કામ શરૂ કરવા રાહ જુએ છે. |
| [ ] | `rahuLater` | Rahu Kaal later today | રાહુ કાળ આજે પછી |
| [ ] | `rahuOver` | Rahu Kaal is over | રાહુ કાળ પૂરો થયો |
| [ ] | `itWas` | It was {range} | {range} હતો |
| [ ] | `bothNow` | Both are happening now. | બંને અત્યારે ચાલુ છે. |
| [ ] | `allNow` | All of these are happening now. | આ બધું અત્યારે ચાલુ છે. |
| [ ] | `nextGoodTime` | Next good time: | હવે પછીનો સારો સમય: |
| [ ] | `tonight` | {time} (tonight) | {time} (આજે રાત્રે) |
| [ ] | `noneLeft` | None left before tomorrow's sunrise | કાલના સૂર્યોદય સુધી હવે નથી |
| [ ] | `comingUp` | Coming up | આવનારા દિવસો |
| [ ] | `festival` | Festival | તહેવાર |
| [ ] | `notVerified` |  · Not yet verified |  · હજી ચકાસાયેલું નથી |
| [ ] | `festivalEvening` | Evening, {range} | સાંજે, {range} |
| [ ] | `rakhiAfter` | Rakhi: after {time} (after Bhadra) | રાખડી: {time} પછી (ભદ્રા પછી) |
| [ ] | `inToday` | today | આજે |
| [ ] | `inTomorrow` | tomorrow | કાલે |
| [ ] | `inDays` | in {n} days | {n} દિવસમાં |
| [ ] | `allDayPastSunrise` | All day, and past the next sunrise | આખો દિવસ, અને આવતા સૂર્યોદય પછી પણ |
| [ ] | `elUntil` | Until {time} | {time} સુધી |
| [ ] | `elThenUntil` | then {name} until {time} | પછી {name} {time} સુધી |
| [ ] | `elThen` | then {name} | પછી {name} |
| [ ] | `listJoin` | ,  | ,  |
| [ ] | `elTithi` | Tithi (lunar day) | તિથિ |
| [ ] | `elNakshatra` | Nakshatra (star) | નક્ષત્ર |
| [ ] | `elYoga` | Yoga | યોગ |
| [ ] | `elKarana` | Karana (half of a tithi) | કરણ (અડધી તિથિ) |
| [ ] | `vishtiBhadra` | {name} (Bhadra) | {name} (ભદ્રા) |
| [ ] | `changesToday` | Changes today | આજે બદલાય છે |
| [ ] | `weekday` | Weekday | વાર |
| [ ] | `sunriseToSunrise` | Sunrise to next sunrise | સૂર્યોદયથી આવતા સૂર્યોદય સુધી |
| [ ] | `twoDayTithi` | Two-day tithi: | બે દિવસની તિથિ: |
| [ ] | `twoDayTithiText` | {tithi} is also the tithi at tomorrow's sunrise. | કાલના સૂર્યોદયે પણ {tithi} જ છે. |
| [ ] | `skippedTithi` | Skipped tithi: | છૂટી તિથિ: |
| [ ] | `skippedTithiText` | {tithi} begins and ends today, so no day is named after it. | {tithi} આજે જ શરૂ થઈને પૂરી થાય છે, તેથી કોઈ દિવસ તેના નામે નથી. |
| [ ] | `noneToday` | None today | આજે નથી |
| [ ] | `samvatVikram` | Vikram Samvat {year} | વિક્રમ સંવત {year} |
| [ ] | `samvatVikramChaitra` | Vikram Samvat {year} (Chaitra start) | વિક્રમ સંવત {year} (ચૈત્રથી) |
| [ ] | `samvatShaka` | Shaka Samvat {year} | શક સંવત {year} |
| [ ] | `trust` | Trust | વિશ્વાસ |
| [ ] | `howBody` | Times use sunrise and sunset in {city}. The tithi comes from the angle between the Sun and the Moon at sunrise. Everything is worked out on your phone; nothing is sent anywhere. | સમય {city}ના સૂર્યોદય અને સૂર્યાસ્ત પ્રમાણે છે. તિથિ સૂર્યોદય વખતે સૂર્ય અને ચંદ્ર વચ્ચેના ખૂણા પરથી નક્કી થાય છે. બધું તમારા ફોનમાં જ ગણાય છે; કંઈ ક્યાંય મોકલાતું નથી. |
| [ ] | `howNote` | If a date or time looks different from your printed calendar, please tell us. | જો કોઈ તારીખ કે સમય તમારા છાપેલા પંચાંગથી જુદો લાગે, તો અમને જણાવો. |
| [ ] | `reportMismatch` | Report a mismatch | તફાવત જણાવો |
| [ ] | `prevDay` | Previous day | આગલો દિવસ |
| [ ] | `nextDay` | Next day | પછીનો દિવસ |
| [ ] | `today` | Today | આજે |
| [ ] | `familyDates` | Family dates | પરિવારની તારીખો |
| [ ] | `festivals` | Festivals | તહેવારો |
| [ ] | `panchang` | Panchang | પંચાંગ |
| [ ] | `hourByHourShort` | Hour by hour | કલાકે કલાકે |
| [ ] | `noCivilDayDate` | There is no sunrise or sunset here on this date, so the panchang can't be worked out. | આ તારીખે અહીં સૂર્યોદય કે સૂર્યાસ્ત નથી, તેથી પંચાંગ ગણી શકાતું નથી. |
| [ ] | `festivalDayOf` | Day {n} of {total} | {total}માંથી {n}મો દિવસ |
| [ ] | `provisionalDate` | Provisional date: please check a printed calendar. | કામચલાઉ તારીખ: કૃપા કરી છાપેલું પંચાંગ જુઓ. |
| [ ] | `prevMonth` | Previous month | આગલો મહિનો |
| [ ] | `nextMonth` | Next month | પછીનો મહિનો |
| [ ] | `adhikBanner` | {month} is an extra lunar month. It comes about every three years to keep the lunar calendar in step with the seasons. | {month} વધારાનો (અધિક) મહિનો છે. ચાંદ્ર કેલેન્ડરને ઋતુઓ સાથે રાખવા તે લગભગ દર ત્રણ વર્ષે આવે છે. |
| [ ] | `bandDay1` | {name} · Day 1 | {name} · પહેલો દિવસ |
| [ ] | `bandLastDay` | Last day | છેલ્લો દિવસ |
| [ ] | `cellToday` | today | આજે |
| [ ] | `cellSelected` | selected | પસંદ કરેલું |
| [ ] | `cellTwoDay` | two-day tithi | બે દિવસની તિથિ |
| [ ] | `cellSkipped` | {tithi} skipped | {tithi} છૂટી |
| [ ] | `cellNotVerified` | {name} (not yet verified) | {name} (હજી ચકાસાયેલું નથી) |
| [ ] | `cellFamily` | {name} (family date) | {name} (પરિવારની તારીખ) |
| [ ] | `twoDayMark` | 2× | ૨× |
| [ ] | `skipMark` | skip | છૂટી |
| [ ] | `keyToday` | Today | આજે |
| [ ] | `keyFestival` | Festival | તહેવાર |
| [ ] | `keyFamily` | Family date | પરિવારની તારીખ |
| [ ] | `keyTwoDay` | Two-day tithi | બે દિવસની તિથિ |
| [ ] | `keySkipped` | Skipped tithi (see the day for details) | છૂટી તિથિ (વિગત માટે દિવસ જુઓ) |
| [ ] | `keyUnverified` | * not yet verified (dev builds only) | * હજી ચકાસાયેલું નથી (માત્ર ડેવલપર બિલ્ડમાં) |
| [ ] | `pitruPaksha` | Pitru Paksha | પિતૃ પક્ષ |
| [ ] | `extraMonth` | Extra month | અધિક મહિનો |
| [ ] | `familyDate` | Family date | પરિવારની તારીખ |
| [ ] | `rowLabelSep` |  ·  |  ·  |
| [ ] | `inCity` |  ({city}) |  ({city}) |
| [ ] | `addDate` | + Add a date | + તારીખ ઉમેરો |
| [ ] | `nudgeTitle` | Save a backup of your family dates. | પરિવારની તારીખોનું બૅકઅપ સાચવો. |
| [ ] | `nudgeBody` | They live only on this phone; a backup file lets you restore them on a new phone. | તે ફક્ત આ ફોનમાં જ છે; બૅકઅપ ફાઇલથી નવા ફોનમાં પાછી લાવી શકાય. |
| [ ] | `saveBackup` | Save a backup | બૅકઅપ સાચવો |
| [ ] | `backupSaved` | Backup saved. | બૅકઅપ સચવાયું. |
| [ ] | `icsSaved` | Calendar file saved. | કેલેન્ડર ફાઇલ સચવાઈ. |
| [ ] | `noDatesTitle` | No family dates yet | હજી કોઈ પરિવારની તારીખ નથી |
| [ ] | `noDatesBody` | Add a birthday by tithi, a varsi or an anniversary. The app works out its date every year, by the lunar calendar. | તિથિ મુજબ જન્મદિવસ, વરસી કે લગ્નતિથિ ઉમેરો. ઍપ દર વર્ષે ચાંદ્ર કેલેન્ડર મુજબ તેની તારીખ ગણે છે. |
| [ ] | `addToCalendar` | Add to your calendar | તમારા કેલેન્ડરમાં ઉમેરો |
| [ ] | `addToCalendarSub` | A calendar file with every family date for the next two years, with reminders. | આવતાં બે વર્ષની બધી પરિવારની તારીખોવાળી કેલેન્ડર ફાઇલ, યાદ અપાવવા સાથે. |
| [ ] | `saveIcs` | Save calendar file (.ics) | કેલેન્ડર ફાઇલ સાચવો (.ics) |
| [ ] | `kindBirthday` | Birthday (by tithi) | જન્મદિવસ (તિથિ મુજબ) |
| [ ] | `kindShraddh` | Varsi / Shraddh | વરસી / શ્રાદ્ધ |
| [ ] | `kindAnniversary` | Anniversary | લગ્નતિથિ |
| [ ] | `kindCustom` | Other | બીજું |
| [ ] | `polWindow` | Which part of the day counts | દિવસનો કયો ભાગ ગણાય |
| [ ] | `polWindowHelp` | Technical terms: udaya (sunrise) or aparahna (afternoon). | શાસ્ત્રીય શબ્દો: ઉદય (સૂર્યોદય) અથવા અપરાહ્ન (બપોર પછી). |
| [ ] | `polWindowSunrise` | Follow printed calendar day | છાપેલા પંચાંગનો દિવસ |
| [ ] | `polWindowAparahna` | Traditional shraddh timing (afternoon) | શ્રાદ્ધનો પરંપરાગત સમય (બપોર પછી) |
| [ ] | `polVriddhi` | When the tithi spans two days | તિથિ બે દિવસ હોય ત્યારે |
| [ ] | `polVriddhiHelp` | Technical term: vriddhi tithi. | શાસ્ત્રીય શબ્દ: વૃદ્ધિ તિથિ. |
| [ ] | `polVriddhiFirst` | First day | પહેલો દિવસ |
| [ ] | `polVriddhiSecond` | Second day | બીજો દિવસ |
| [ ] | `polKshaya` | When the tithi is skipped that year | તે વર્ષે તિથિ છૂટી જાય ત્યારે |
| [ ] | `polKshayaHelp` | Technical term: kshaya tithi. | શાસ્ત્રીય શબ્દ: ક્ષય તિથિ. |
| [ ] | `polKshayaSame` | The day the tithi falls in the calendar | પંચાંગમાં તિથિ આવે તે દિવસ |
| [ ] | `polKshayaNext` | The next day | પછીનો દિવસ |
| [ ] | `polAdhik` | In a year with an extra month | અધિક મહિનાવાળા વર્ષમાં |
| [ ] | `polAdhikHelp` | Technical terms: adhik (extra) and nija (regular) month. | શાસ્ત્રીય શબ્દો: અધિક (વધારાનો) અને નિજ (મૂળ) મહિનો. |
| [ ] | `polAdhikNija` | Regular month | મૂળ મહિનો |
| [ ] | `polAdhikAdhik` | Extra month | અધિક મહિનો |
| [ ] | `polAdhikMatch` | Match the original month | મૂળ તારીખ જે મહિનામાં હતી તે |
| [ ] | `polAdhikBoth` | Both | બંને |
| [ ] | `polSource` | When working out the tithi from a date | તારીખ પરથી તિથિ શોધતી વખતે |
| [ ] | `polSourceHelp` | Used by “I know the date”. | “મને તારીખ ખબર છે” માટે વપરાય છે. |
| [ ] | `polSourceMoment` | Tithi at the time of birth/passing | જન્મ/અવસાનના સમયની તિથિ |
| [ ] | `polSourceCalendar` | Tithi shown on the calendar for that date | તે તારીખે પંચાંગમાં છપાયેલી તિથિ |
| [ ] | `usualDefault` | Usual default | સામાન્ય પસંદગી |
| [ ] | `familyDefault` | Family default | પરિવારની પસંદગી |
| [ ] | `inheritedValue` | {source}: {value} | {source}: {value} |
| [ ] | `useUsualDefault` | Use the usual default | સામાન્ય પસંદગી રાખો |
| [ ] | `useFamilyDefault` | Use the family default | પરિવારની પસંદગી રાખો |
| [ ] | `errName` | Please give this date a name. | કૃપા કરી આ તારીખને નામ આપો. |
| [ ] | `errConfirm` | Please work out and confirm the tithi first. | કૃપા કરી પહેલાં તિથિ શોધીને ખાતરી કરો. |
| [ ] | `backToDates` | ‹ Family dates | ‹ પરિવારની તારીખો |
| [ ] | `editDate` | Edit family date | પરિવારની તારીખ બદલો |
| [ ] | `addFamilyDate` | Add a family date | પરિવારની તારીખ ઉમેરો |
| [ ] | `name` | Name | નામ |
| [ ] | `namePlaceholder` | e.g. Ba's varsi | દા.ત. બાની વરસી |
| [ ] | `whatKind` | What kind of date? | કેવી તારીખ છે? |
| [ ] | `theDate` | The date | તારીખ |
| [ ] | `knowDate` | I know the date | મને તારીખ ખબર છે |
| [ ] | `knowTithi` | I know the tithi | મને તિથિ ખબર છે |
| [ ] | `tithiIs` | Tithi: | તિથિ: |
| [ ] | `workedOutFrom` | Worked out from {date}{time}, {place} | {date}{time}, {place} પરથી ગણી |
| [ ] | `remindMe` | Remind me | મને યાદ અપાવો |
| [ ] | `onTheDay` | On the day | તે જ દિવસે |
| [ ] | `dayBefore` | 1 day before | ૧ દિવસ પહેલાં |
| [ ] | `webReminders` | On the web, reminders come through the calendar file (Family dates → Save calendar file). | વેબ પર યાદ કેલેન્ડર ફાઇલથી આવે છે (પરિવારની તારીખો → કેલેન્ડર ફાઇલ સાચવો). |
| [ ] | `alsoPitru` | Also remind me during Pitru Paksha (Shraddh fortnight) | પિતૃ પક્ષ (શ્રાદ્ધ પખવાડિયા)માં પણ યાદ અપાવો |
| [ ] | `whichPitruDay` | Which Pitru Paksha day | પિતૃ પક્ષનો કયો દિવસ |
| [ ] | `mahalayaHelp` | Technical term: Mahalaya. | શાસ્ત્રીય શબ્દ: મહાલય. |
| [ ] | `sameTithiUsual` | Same tithi (usual) | એ જ તિથિ (સામાન્ય) |
| [ ] | `sarvaPitru` | {tithi} (Sarva Pitru Amas) | {tithi} (સર્વ પિતૃ અમાસ) |
| [ ] | `notes` | Notes (optional) | નોંધ (મરજિયાત) |
| [ ] | `advanced` | Advanced: how this date is placed | વધુ: આ તારીખ કેવી રીતે નક્કી થાય |
| [ ] | `advancedIntro` | Leave these on the family default unless this date follows a different custom. Family defaults are in Settings → Family conventions. | આ તારીખનો રિવાજ જુદો ન હોય તો પરિવારની પસંદગી જ રાખો. પરિવારની પસંદગી સેટિંગ્સ → પરિવારના રિવાજમાં છે. |
| [ ] | `useSunriseIn` | Use sunrise in | સૂર્યોદય આ શહેરનો |
| [ ] | `thisDateOnly` | (this date only) | (ફક્ત આ તારીખ માટે) |
| [ ] | `familyDefaultParen` | (family default) | (પરિવારની પસંદગી) |
| [ ] | `useFamilyDefaultCity` | Use family default ({city}) | પરિવારની પસંદગી રાખો ({city}) |
| [ ] | `changeCityForDate` | Change city for this date | આ તારીખ માટે શહેર બદલો |
| [ ] | `resetAll` | Use family defaults for all of these | આ બધા માટે પરિવારની પસંદગી રાખો |
| [ ] | `save` | Save | સાચવો |
| [ ] | `delete` | Delete | કાઢી નાખો |
| [ ] | `confirmDelete` | Delete “{title}”? This can't be undone. | “{title}” કાઢી નાખવું છે? પાછું લાવી શકાશે નહીં. |
| [ ] | `month` | Month | મહિનો |
| [ ] | `sudVad` | Sud / Vad | સુદ / વદ |
| [ ] | `tithi` | Tithi | તિથિ |
| [ ] | `sudBright` | Sud (bright half) | સુદ (અજવાળિયું) |
| [ ] | `vadDark` | Vad (dark half) | વદ (અંધારિયું) |
| [ ] | `extraMonthCheck` | It was in an extra month (adhik) | તે અધિક મહિનામાં હતી |
| [ ] | `histZoneWarning` | Before 1955, many places in India kept their own local time (such as Bombay time), so the time you entered may be off by up to 40 minutes. Please check the tithi with a printed calendar from that year. | ૧૯૫૫ પહેલાં ભારતનાં ઘણાં સ્થળોએ પોતાનો સ્થાનિક સમય (જેમ કે મુંબઈ સમય) ચાલતો, તેથી તમે લખેલો સમય ૪૦ મિનિટ સુધી આઘોપાછો હોઈ શકે. કૃપા કરી તે વર્ષના છાપેલા પંચાંગમાં તિથિ જુઓ. |
| [ ] | `errFullDate` | Please enter a full date. | કૃપા કરી પૂરી તારીખ લખો. |
| [ ] | `errWorkOut` | The tithi couldn't be worked out for that place and date. | તે સ્થળ અને તારીખ માટે તિથિ ગણી શકાઈ નહીં. |
| [ ] | `worksOutTo` | This works out to {tithi}. Is that right? | આ {tithi} થાય છે. બરાબર છે? |
| [ ] | `beforeSunriseDay` | The time is before sunrise, so it counts as the day of {date}. | સમય સૂર્યોદય પહેલાંનો છે, તેથી તે {date}નો દિવસ ગણાય. |
| [ ] | `nearChangeWarning` | Close to a tithi change. Please check with a printed calendar. | તિથિ બદલાવાની નજીક છે. કૃપા કરી છાપેલું પંચાંગ જુઓ. |
| [ ] | `yesUseThis` | Yes, use this | હા, આ રાખો |
| [ ] | `changeTheDate` | Change the date | તારીખ બદલો |
| [ ] | `date` | Date | તારીખ |
| [ ] | `timeOptional` | Time (optional) | સમય (મરજિયાત) |
| [ ] | `timeHint` | Local time where it happened. | જ્યાં બન્યું ત્યાંનો સ્થાનિક સમય. |
| [ ] | `whereItHappened` | Where it happened: | ક્યાં બન્યું: |
| [ ] | `changePlace` | Change place | સ્થળ બદલો |
| [ ] | `workOut` | Work out the tithi | તિથિ શોધો |
| [ ] | `thisDateMissing` | This family date no longer exists. | આ પરિવારની તારીખ હવે નથી. |
| [ ] | `settings` | Settings | સેટિંગ્સ |
| [ ] | `place` | Place | સ્થળ |
| [ ] | `showingFor` | Showing the panchang for {city} | {city}નું પંચાંગ બતાવે છે |
| [ ] | `changeCity` | Change city | શહેર બદલો |
| [ ] | `familySunriseIn` | Family dates use sunrise in {city} | પરિવારની તારીખો {city}ના સૂર્યોદય મુજબ |
| [ ] | `familySunriseHelp` | Usually where the family observes them. Living abroad but following India's date? Choose the Indian city. | સામાન્ય રીતે જ્યાં પરિવાર તે ઉજવે છે. વિદેશમાં રહો છો પણ ભારતની તારીખ પાળો છો? ભારતનું શહેર પસંદ કરો. |
| [ ] | `changeFamilyCity` | Change city for family dates | પરિવારની તારીખો માટે શહેર બદલો |
| [ ] | `display` | Display | દેખાવ |
| [ ] | `yearStyle` | Year style | વર્ષની ગણતરી |
| [ ] | `yearKartikadi` | Vikram Samvat (Gujarati, from Diwali) | વિક્રમ સંવત (ગુજરાતી, દિવાળીથી) |
| [ ] | `yearChaitradi` | Vikram Samvat (from Chaitra) | વિક્રમ સંવત (ચૈત્રથી) |
| [ ] | `yearShaka` | Shaka Samvat | શક સંવત |
| [ ] | `language` | Language | ભાષા |
| [ ] | `textSize` | Text size | અક્ષરનું કદ |
| [ ] | `sizeNormal` | Normal | સામાન્ય |
| [ ] | `sizeLarge` | Large | મોટું |
| [ ] | `sizeLarger` | Larger | વધુ મોટું |
| [ ] | `sizeLargest` | Largest | સૌથી મોટું |
| [ ] | `colours` | Colours | રંગ |
| [ ] | `paletteCalm` | Calm | શાંત |
| [ ] | `paletteMandir` | Mandir | મંદિર |
| [ ] | `paletteRaat` | Raat | રાત |
| [ ] | `lightOrDark` | Light or dark | આછું કે ઘાટું |
| [ ] | `modeSystem` | Same as phone | ફોન મુજબ |
| [ ] | `modeLight` | Light | આછું |
| [ ] | `modeDark` | Dark | ઘાટું |
| [ ] | `familyConventions` | Family conventions | પરિવારના રિવાજ |
| [ ] | `familyConventionsSub` | How your family places dates when the calendar is unclear. Each family date can still change these under Advanced. | પંચાંગ સ્પષ્ટ ન હોય ત્યારે તમારો પરિવાર તારીખ કેવી રીતે નક્કી કરે છે. દરેક તારીખ “વધુ”માં આ બદલી શકે છે. |
| [ ] | `alsoPitruShort` | Also remind during Pitru Paksha (Shraddh fortnight) | પિતૃ પક્ષ (શ્રાદ્ધ પખવાડિયા)માં પણ યાદ અપાવો |
| [ ] | `backup` | Backup | બૅકઅપ |
| [ ] | `backupSub` | Family dates live only on this phone. Save a backup file to keep them safe or move them to another phone. | પરિવારની તારીખો ફક્ત આ ફોનમાં છે. સુરક્ષિત રાખવા કે બીજા ફોનમાં લઈ જવા બૅકઅપ ફાઇલ સાચવો. |
| [ ] | `lastBackup` | Last backup: {date} | છેલ્લું બૅકઅપ: {date} |
| [ ] | `noBackupYet` | No backup saved yet. | હજી કોઈ બૅકઅપ સાચવ્યું નથી. |
| [ ] | `restoreBackup` | Restore from a backup file | બૅકઅપ ફાઇલમાંથી પાછું લાવો |
| [ ] | `backupRestored` | Backup restored. | બૅકઅપ પાછું આવ્યું. |
| [ ] | `confirmRestoreOne` | Replace your family dates and settings with the backup from {date} ({count} family date)? | તમારી પરિવારની તારીખો અને સેટિંગ્સને {date}ના બૅકઅપથી બદલવી છે ({count} પરિવારની તારીખ)? |
| [ ] | `confirmRestoreMany` | Replace your family dates and settings with the backup from {date} ({count} family dates)? | તમારી પરિવારની તારીખો અને સેટિંગ્સને {date}ના બૅકઅપથી બદલવી છે ({count} પરિવારની તારીખો)? |
| [ ] | `backupNotBackup` | This file is not a backup from this app. | આ ફાઇલ આ ઍપનું બૅકઅપ નથી. |
| [ ] | `backupNewer` | This backup was made by a newer version of the app. Please update the app first. | આ બૅકઅપ ઍપના નવા સંસ્કરણથી બન્યું છે. કૃપા કરી પહેલાં ઍપ અપડેટ કરો. |
| [ ] | `backupDamaged` | This backup file is damaged and could not be restored. | આ બૅકઅપ ફાઇલ ખરાબ છે અને પાછી લાવી શકાઈ નહીં. |
| [ ] | `confirmChangeOne` | This changes the dates of 1 family date. Continue? | આથી ૧ પરિવારની તારીખ બદલાશે. આગળ વધવું છે? |
| [ ] | `confirmChangeMany` | This changes the dates of {n} family dates. Continue? | આથી {n} પરિવારની તારીખો બદલાશે. આગળ વધવું છે? |
| [ ] | `about` | About | માહિતી |
| [ ] | `privateTitle` | Private by design. | ખાનગી રહે તે રીતે બનાવેલું. |
| [ ] | `privateBody` | Everything stays on your phone. No account, no ads, no tracking. | બધું તમારા ફોનમાં જ રહે છે. ન ખાતું, ન જાહેરાત, ન ટ્રૅકિંગ. |
| [ ] | `cityAttribution` | City data: GeoNames (geonames.org), CC-BY 4.0. | શહેરોની માહિતી: GeoNames (geonames.org), CC-BY 4.0. |
| [ ] | `engineVersion` | Engine version {v} | એન્જિન સંસ્કરણ {v} |
| [ ] | `back` | ‹ Back | ‹ પાછા |
| [ ] | `stepOf` | Step {n} of {total} | {total}માંથી પગલું {n} |
| [ ] | `skip` | Skip | છોડો |
| [ ] | `onbTitle` | Your panchang, on your phone | તમારું પંચાંગ, તમારા ફોનમાં |
| [ ] | `onbBody` | Tithi, Choghadiya and your family's dates, worked out for your city's sunrise. No account; nothing leaves your phone. | તિથિ, ચોઘડિયાં અને તમારા પરિવારની તારીખો, તમારા શહેરના સૂર્યોદય મુજબ. ખાતું નહીં; કંઈ ફોનની બહાર જતું નથી. |
| [ ] | `chooseLanguage` | Choose your language | તમારી ભાષા પસંદ કરો |
| [ ] | `searchCity` | Search your city | તમારું શહેર શોધો |
| [ ] | `onbCityHint` | Sunrise in your city decides each day's tithi. | તમારા શહેરનો સૂર્યોદય દરેક દિવસની તિથિ નક્કી કરે છે. |
| [ ] | `cityAttributionShort` | City data: GeoNames (geonames.org), CC-BY 4.0 | શહેરોની માહિતી: GeoNames (geonames.org), CC-BY 4.0 |
| [ ] | `cityPlaceholder` | e.g. Ahmedabad, Nadiad, Edison | દા.ત. Ahmedabad, Nadiad, અમદાવાદ |
| [ ] | `cityLoadError` | City list could not be loaded. Try again. | શહેરોની યાદી ખૂલી નહીં. ફરી પ્રયત્ન કરો. |
| [ ] | `cityNotFound` | No city found. Try a nearby larger town. | શહેર મળ્યું નહીં. નજીકનું મોટું ગામ કે શહેર લખી જુઓ. |
| [ ] | `installTitle` | Install the app | ઍપ ઇન્સ્ટૉલ કરો |
| [ ] | `installBody` | Open it from your home screen, like any app. It works without internet. | બીજી ઍપની જેમ હોમ સ્ક્રીન પરથી ખોલો. ઇન્ટરનેટ વગર પણ ચાલે છે. |
| [ ] | `installButton` | Install | ઇન્સ્ટૉલ કરો |
| [ ] | `installIos` | On iPhone: tap Share, then “Add to Home Screen”. | iPhone પર: શેર દબાવો, પછી “Add to Home Screen”. |
| [ ] | `notNow` | Not now | હમણાં નહીં |
| [ ] | `updateReady` | A new version is ready. | નવું સંસ્કરણ તૈયાર છે. |
| [ ] | `updateReload` | Update now | હમણાં અપડેટ કરો |
| [ ] | `offlineReady` | Ready to work without internet. | ઇન્ટરનેટ વગર ચાલવા તૈયાર. |
| [ ] | `channelName` | Family date reminders | પરિવારની તારીખોની યાદ |
| [ ] | `channelDescription` | Reminders for birthdays by tithi, varsi and other family dates. | તિથિ મુજબ જન્મદિવસ, વરસી અને પરિવારની બીજી તારીખોની યાદ. |
| [ ] | `remindToday` | Today | આજે |
| [ ] | `remindTomorrow` | Tomorrow | કાલે |
| [ ] | `remindInDays` | In {n} days | {n} દિવસમાં |
| [ ] | `testTitle` | Test reminder | ચકાસણી માટેની યાદ |
| [ ] | `testBody` | Reminders work on this phone. | આ ફોન પર યાદ બરાબર આવે છે. |
| [ ] | `reminderTime` | Remind me at | યાદ આ સમયે અપાવો |
| [ ] | `reminderTimeHelp` | Phone time. If a family date follows another city, the reminder comes no later than this time there. | ફોનનો સમય. જો તારીખ બીજા શહેર મુજબ હોય, તો યાદ ત્યાંના આ સમયથી મોડી નહીં આવે. |
| [ ] | `reminders` | Reminders | યાદ |
| [ ] | `healthLink` | Check that reminders can arrive | યાદ આવી શકે છે કે નહીં તે તપાસો |
| [ ] | `backToSettings` | ‹ Settings | ‹ સેટિંગ્સ |
| [ ] | `healthTitle` | Reminders on this phone | આ ફોન પર યાદ |
| [ ] | `healthWeb` | On the web, the app cannot send reminders. Save the calendar file from Family dates and your calendar app will remind you. | વેબ પર ઍપ યાદ મોકલી શકતી નથી. પરિવારની તારીખોમાંથી કેલેન્ડર ફાઇલ સાચવો, તમારી કેલેન્ડર ઍપ યાદ અપાવશે. |
| [ ] | `healthIntro` | Phones can block reminders to save battery. Each check below should be green. | બૅટરી બચાવવા ફોન યાદ રોકી શકે છે. નીચેની દરેક તપાસ લીલી હોવી જોઈએ. |
| [ ] | `healthPermission` | Notifications | સૂચનાઓ |
| [ ] | `healthPermissionOk` | Allowed. | મંજૂર છે. |
| [ ] | `healthPermissionBad` | Not allowed, so reminders cannot appear. | મંજૂર નથી, તેથી યાદ દેખાઈ શકશે નહીં. |
| [ ] | `healthAllow` | Allow notifications | સૂચનાઓ મંજૂર કરો |
| [ ] | `healthOpenSettings` | Open phone settings | ફોનનાં સેટિંગ્સ ખોલો |
| [ ] | `healthExact` | On-time reminders | સમયસર યાદ |
| [ ] | `healthExactOk` | Reminders arrive at the time you chose. | તમે પસંદ કરેલા સમયે જ યાદ આવે છે. |
| [ ] | `healthExactBad` | Off, so reminders may come late. Turn on “Alarms & reminders” for this app. | બંધ છે, તેથી યાદ મોડી આવી શકે. આ ઍપ માટે “Alarms & reminders” ચાલુ કરો. |
| [ ] | `healthBattery` | Battery | બૅટરી |
| [ ] | `healthBatteryOk` | Unrestricted: the phone will not stop reminders. | કોઈ રોક નથી: ફોન યાદ નહીં રોકે. |
| [ ] | `healthBatteryBad` | Battery saving may delay or stop reminders. Choose “Unrestricted” (or “Don’t optimise”) for this app. | બૅટરી બચત યાદ મોડી કે બંધ કરી શકે. આ ઍપ માટે “Unrestricted” (અથવા “Don’t optimise”) પસંદ કરો. |
| [ ] | `healthOk` | OK | બરાબર |
| [ ] | `healthNeedsAttention` | Needs attention | ધ્યાન આપો |
| [ ] | `healthSamsungTitle` | On Samsung phones | સેમસંગ ફોન પર |
| [ ] | `healthSamsung` | Open Settings → Apps → Parivar Panchang → Battery, and choose “Unrestricted”. Open Settings → Battery → Background usage limits → Never sleeping apps, and add Parivar Panchang. If “Put unused apps to sleep” is on, make sure Parivar Panchang is not in “Sleeping apps”. | સેટિંગ્સ → Apps → Parivar Panchang (પરિવાર પંચાંગ) → Battery ખોલો અને “Unrestricted” પસંદ કરો. સેટિંગ્સ → Battery → Background usage limits → Never sleeping apps ખોલો અને Parivar Panchang (પરિવાર પંચાંગ) ઉમેરો. “Put unused apps to sleep” ચાલુ હોય તો Parivar Panchang (પરિવાર પંચાંગ) “Sleeping apps”માં ન હોય તે જુઓ. |
| [ ] | `healthXiaomiTitle` | On Xiaomi, Redmi and POCO phones | શાઓમી, રેડમી અને પોકો ફોન પર |
| [ ] | `healthXiaomi` | Open Settings → Apps → Manage apps → Parivar Panchang. Turn on “Autostart”. Open “Battery saver” and choose “No restrictions”. In the recent-apps screen, press and hold Parivar Panchang and tap the lock icon. | સેટિંગ્સ → Apps → Manage apps → Parivar Panchang (પરિવાર પંચાંગ) ખોલો. “Autostart” ચાલુ કરો. “Battery saver” ખોલો અને “No restrictions” પસંદ કરો. તાજેતરની ઍપની સ્ક્રીનમાં Parivar Panchang (પરિવાર પંચાંગ) દબાવી રાખો અને તાળાનું ચિહ્ન દબાવો. |
| [ ] | `healthTestTitle` | Test it | ચકાસો |
| [ ] | `healthTestBody` | Tap the button, lock the phone, and wait one minute. A test reminder should appear. | બટન દબાવો, ફોન લૉક કરો અને એક મિનિટ રાહ જુઓ. ચકાસણીની યાદ દેખાવી જોઈએ. |
| [ ] | `healthTestButton` | Send a test reminder in 1 minute | ૧ મિનિટમાં ચકાસણીની યાદ મોકલો |
| [ ] | `healthTestSent` | Test reminder set for one minute from now. | હવેથી એક મિનિટ પછી ચકાસણીની યાદ ગોઠવી. |
| [ ] | `appName` | Parivar Panchang | પરિવાર પંચાંગ |
| [ ] | `panchangDayUntil` | Panchang day: {weekday} · until sunrise {time} | પંચાંગ દિવસ: {weekday} · સૂર્યોદય {time} સુધી |
| [ ] | `appVersion` | Version {v} | સંસ્કરણ {v} |
| [ ] | `privacyPolicy` | Privacy policy | ગોપનીયતા નીતિ |
| [ ] | `readMore` | Read the full explanation | પૂરી સમજૂતી વાંચો |
| [ ] | `backHome` | ‹ Back to the app | ‹ ઍપ પર પાછા |
| [ ] | `howDayTitle` | A day runs from sunrise to sunrise | દિવસ એક સૂર્યોદયથી બીજા સૂર્યોદય સુધી |
| [ ] | `howDayBody` | As in a printed panchang, each day starts at sunrise. Sunrise is the moment the top edge of the Sun appears on a flat horizon, with the usual allowance for the air bending light. Times are worked out for your city, so they can differ by a minute or two from a calendar printed for a nearby city. | છાપેલા પંચાંગની જેમ, દરેક દિવસ સૂર્યોદયથી શરૂ થાય છે. સૂર્યોદય એટલે સપાટ ક્ષિતિજ પર સૂર્યની ઉપરની કિનાર દેખાય તે ક્ષણ, હવાથી પ્રકાશ વળે તેની સામાન્ય ગણતરી સાથે. સમય તમારા શહેર માટે ગણાય છે, તેથી નજીકના શહેર માટે છપાયેલા પંચાંગથી એક-બે મિનિટ જુદો હોઈ શકે. |
| [ ] | `howTithiTitle` | Tithi | તિથિ |
| [ ] | `howTithiBody` | A tithi is the time the Moon takes to move 12° further ahead of the Sun. The tithi at sunrise gives the day its name. If one tithi is present at two sunrises, it is a two-day tithi; if a tithi begins and ends between two sunrises, it is skipped and no day is named after it. | તિથિ એટલે ચંદ્રને સૂર્યથી ૧૨° વધુ આગળ જતાં લાગતો સમય. સૂર્યોદય વખતની તિથિ દિવસનું નામ આપે છે. એક તિથિ બે સૂર્યોદયે હોય તો તે બે દિવસની તિથિ; બે સૂર્યોદય વચ્ચે જ શરૂ થઈને પૂરી થાય તો તે છૂટી તિથિ, અને કોઈ દિવસ તેના નામે નથી. |
| [ ] | `howStarsTitle` | Nakshatra, yoga and karana | નક્ષત્ર, યોગ અને કરણ |
| [ ] | `howStarsBody` | Nakshatra and yoga use the Moon’s and Sun’s positions among the stars, measured with the Lahiri ayanamsa that Indian calendars use. A karana is half a tithi; Vishti karana is also called Bhadra. | નક્ષત્ર અને યોગ તારાઓ વચ્ચે ચંદ્ર અને સૂર્યની સ્થિતિ પરથી ગણાય છે, ભારતીય પંચાંગો વાપરે છે તે લાહિરી અયનાંશ સાથે. કરણ એટલે અડધી તિથિ; વિષ્ટિ કરણને ભદ્રા પણ કહે છે. |
| [ ] | `howMonthsTitle` | Months and years | મહિના અને વર્ષ |
| [ ] | `howMonthsBody` | Months follow the Gujarati style: a month ends on Amas. When a lunar month has no change of solar sign, it is an extra (adhik) month. The Vikram Samvat year changes the day after Diwali, at Bestu Varas. | મહિના ગુજરાતી પદ્ધતિએ ગણાય છે: મહિનો અમાસે પૂરો થાય છે. જે ચાંદ્ર મહિનામાં સૂર્યની રાશિ ન બદલાય, તે અધિક મહિનો. વિક્રમ સંવતનું વર્ષ દિવાળી પછીના દિવસે, બેસતા વર્ષે બદલાય છે. |
| [ ] | `howTimesTitle` | Choghadiya and times many avoid | ચોઘડિયાં અને ઘણા ટાળે તે સમય |
| [ ] | `howTimesBody` | Daylight and night are each split into 8 equal Choghadiya. Rahu Kaal, Yamaganda and Gulika are one-eighth of daylight each, chosen by the weekday. Bhadra is shown from its real start to its real end. | દિવસ અને રાત્રિ દરેક ૮ સરખાં ચોઘડિયાંમાં વહેંચાય છે. રાહુ કાળ, યમઘંટ અને ગુલિક વાર મુજબ દિવસના આઠમા ભાગ જેટલા હોય છે. ભદ્રા તેની સાચી શરૂઆતથી સાચા અંત સુધી બતાવાય છે. |
| [ ] | `howFamilyTitle` | Family dates | પરિવારની તારીખો |
| [ ] | `howFamilyBody` | A family date is saved as a lunar date, such as Kartak Vad 5, and its day is worked out again every year using sunrise in the city you chose and your family conventions (for example, afternoon timing for a varsi). Reminders on Android come at your chosen time, and never later than that time in the family’s city. | પરિવારની તારીખ ચાંદ્ર તારીખ (જેમ કે કારતક વદ ૫) તરીકે સચવાય છે, અને દર વર્ષે તમે પસંદ કરેલા શહેરના સૂર્યોદય અને તમારા પરિવારના રિવાજ (જેમ કે વરસી માટે બપોર પછીનો સમય) મુજબ તેનો દિવસ ફરી ગણાય છે. Android પર યાદ તમે પસંદ કરેલા સમયે આવે છે, અને પરિવારના શહેરના એ સમયથી મોડી ક્યારેય નહીં. |
| [ ] | `howAccuracyTitle` | How accurate it is | કેટલું ચોક્કસ છે |
| [ ] | `howAccuracyBody` | Checked against Drik Panchang for Ahmedabad on 82 days in 2026–27: sunrise and sunset within 33 seconds; tithi and karana end times within about 1½ minutes; nakshatra and yoga within 1 minute. On every day checked, the tithi, nakshatra, yoga, karana, month and year matched. | ૨૦૨૬–૨૭ના ૮૨ દિવસ માટે અમદાવાદનું દૃક પંચાંગ સાથે સરખાવ્યું: સૂર્યોદય અને સૂર્યાસ્ત ૩૩ સેકન્ડની અંદર; તિથિ અને કરણ પૂરા થવાનો સમય આશરે દોઢ મિનિટની અંદર; નક્ષત્ર અને યોગ ૧ મિનિટની અંદર. તપાસેલા દરેક દિવસે તિથિ, નક્ષત્ર, યોગ, કરણ, મહિનો અને વર્ષ મળતાં આવ્યાં. |
| [ ] | `howFestivalsTitle` | Festivals | તહેવારો |
| [ ] | `howFestivalsBody` | Festival dates depend on traditions as well as astronomy. A festival appears in the app only after its dates have been checked against printed calendars for several years. | તહેવારોની તારીખ ખગોળ સાથે પરંપરા પર પણ આધાર રાખે છે. કોઈ તહેવાર ઍપમાં ત્યારે જ દેખાય છે જ્યારે તેની તારીખો ઘણાં વર્ષો માટે છાપેલાં પંચાંગ સાથે ચકાસાઈ હોય. |
| [ ] | `howPhoneTitle` | All on your phone | બધું તમારા ફોનમાં |
| [ ] | `howPhoneBody` | Every calculation runs on your phone, with the open-source astronomy-engine library. Nothing is sent anywhere. If something differs from your printed calendar, please tell us. | દરેક ગણતરી તમારા ફોનમાં જ, ખુલ્લા સ્રોતની astronomy-engine લાઇબ્રેરીથી થાય છે. કંઈ ક્યાંય મોકલાતું નથી. છાપેલા પંચાંગથી કંઈ જુદું લાગે તો અમને જણાવો. |
| [ ] | `privacyUpdated` | Last updated: 24 October 2026 | છેલ્લો સુધારો: ૨૪ ઑક્ટોબર ૨૦૨૬ |
| [ ] | `privacyShortTitle` | In short | ટૂંકમાં |
| [ ] | `privacyShort` | Parivar Panchang collects no data. There is no account, no analytics, no advertising and no tracking. Everything you enter stays on your device. | પરિવાર પંચાંગ કોઈ માહિતી એકઠી કરતું નથી. ન ખાતું, ન ઍનાલિટિક્સ, ન જાહેરાત, ન ટ્રૅકિંગ. તમે લખો તે બધું તમારા ઉપકરણમાં જ રહે છે. |
| [ ] | `privacyStoredTitle` | What is stored, and where | શું સચવાય છે, અને ક્યાં |
| [ ] | `privacyStored` | Your city, settings, family dates and notes, and saved calculations are stored only on your device (in the app’s or browser’s own storage). They are never sent to us or anyone else. Uninstalling the app, or clearing the website’s data in your browser, deletes them. | તમારું શહેર, સેટિંગ્સ, પરિવારની તારીખો અને નોંધ, અને સાચવેલી ગણતરીઓ ફક્ત તમારા ઉપકરણમાં (ઍપ કે બ્રાઉઝરના પોતાના સંગ્રહમાં) રહે છે. તે ક્યારેય અમને કે બીજા કોઈને મોકલાતી નથી. ઍપ કાઢી નાખવાથી, કે બ્રાઉઝરમાં વેબસાઇટની માહિતી સાફ કરવાથી, તે ભૂંસાઈ જાય છે. |
| [ ] | `privacyFilesTitle` | Backup and calendar files | બૅકઅપ અને કેલેન્ડર ફાઇલ |
| [ ] | `privacyFiles` | A backup or calendar file is created only when you tap to save it, and goes only where you choose to save or share it. | બૅકઅપ કે કેલેન્ડર ફાઇલ ત્યારે જ બને છે જ્યારે તમે સાચવવા દબાવો, અને ફક્ત તમે પસંદ કરો ત્યાં જ સચવાય કે મોકલાય છે. |
| [ ] | `privacyNetworkTitle` | Internet use | ઇન્ટરનેટનો ઉપયોગ |
| [ ] | `privacyNetwork` | The Android app does not use the internet. The website downloads the app’s files from our host, Vercel, whose servers keep standard technical logs (such as IP address and browser type) to run and protect the service; we do not use them to identify you. “Report a mismatch” opens a pre-filled page on GitHub in your browser, and nothing is sent unless you submit it there. | Android ઍપ ઇન્ટરનેટ વાપરતી નથી. વેબસાઇટ ઍપની ફાઇલો અમારા હોસ્ટ Vercel પરથી ડાઉનલોડ કરે છે, જેના સર્વર સેવા ચલાવવા અને સુરક્ષિત રાખવા સામાન્ય તકનીકી લૉગ (જેમ કે IP સરનામું અને બ્રાઉઝરનો પ્રકાર) રાખે છે; અમે તેનાથી તમારી ઓળખ કરતા નથી. “તફાવત જણાવો” તમારા બ્રાઉઝરમાં GitHub પર ભરેલું પાનું ખોલે છે, અને તમે ત્યાં મોકલો નહીં ત્યાં સુધી કંઈ જતું નથી. |
| [ ] | `privacyPermissionsTitle` | Android permissions | Android પરવાનગીઓ |
| [ ] | `privacyPermissions` | Notifications, to show family-date reminders. Alarms and reminders (exact alarms), so reminders arrive on time. Run at startup, so reminders survive a restart. Internet is declared by the app framework but not used. | સૂચનાઓ: પરિવારની તારીખોની યાદ બતાવવા. Alarms & reminders (ચોક્કસ સમય): યાદ સમયસર આવે તે માટે. ફોન શરૂ થતાં ચાલવું: ફોન ફરી શરૂ થયા પછી પણ યાદ રહે તે માટે. ઇન્ટરનેટની પરવાનગી ઍપના માળખામાં જાહેર છે પણ વપરાતી નથી. |
| [ ] | `privacyChildrenTitle` | Children | બાળકો |
| [ ] | `privacyChildren` | The app collects no data from anyone, including children. | ઍપ કોઈની પણ, બાળકો સહિત, માહિતી એકઠી કરતી નથી. |
| [ ] | `privacyChangesTitle` | Changes and contact | ફેરફાર અને સંપર્ક |
| [ ] | `privacyChanges` | If this policy changes, the new version will appear on this page with a new date. Questions: open an issue at github.com/bhavy67/pocket-panchang. | આ નીતિ બદલાય તો નવી આવૃત્તિ નવી તારીખ સાથે આ પાના પર દેખાશે. પ્રશ્નો: github.com/bhavy67/pocket-panchang પર issue ખોલો. |
| [ ] | `changeCityAria` | Change city, now {city} | શહેર બદલો, હાલ {city} |
| [ ] | `todaysTithi` | Today's tithi | આજની તિથિ |
| [ ] | `rightNow` | Right now · {time} | અત્યારે · {time} |
| [ ] | `goodNowUntil` | Good time now, until {time} | અત્યારે સારો સમય, {time} સુધી |
| [ ] | `goodStartsAt` | Good time starts at {time} | સારો સમય {time} એ શરૂ થાય છે |
| [ ] | `goodStartsTonight` | Good time starts at {time} tonight | સારો સમય આજે રાત્રે {time} એ શરૂ થાય છે |
| [ ] | `noGoodLeftShort` | No good time left before sunrise | સૂર્યોદય સુધી હવે સારો સમય નથી |
| [ ] | `whyOverlapOne` | {cur} is a good time, but {avoid} is on, so many families wait. | {cur} સારો સમય છે, પણ {avoid} ચાલુ છે, તેથી ઘણા પરિવારો રાહ જુએ છે. |
| [ ] | `whyOverlapMany` | {cur} is a good time, but {avoid} are on, so many families wait. | {cur} સારો સમય છે, પણ {avoid} ચાલુ છે, તેથી ઘણા પરિવારો રાહ જુએ છે. |
| [ ] | `whyClean` | {cur} is a good time, and nothing many avoid is on. | {cur} સારો સમય છે, અને ઘણા ટાળે તેવું કંઈ ચાલુ નથી. |
| [ ] | `whyBad` | {cur} is a time many avoid for new work. | {cur} એ સમય છે જેમાં ઘણા નવું કામ ટાળે છે. |
| [ ] | `whyNeutral` | {cur} is a neutral time: fine for routine work. | {cur} સામાન્ય સમય છે: રોજનાં કામ માટે બરાબર. |
| [ ] | `qShortGood` | good | સારો |
| [ ] | `qShortAvoid` | avoid | ટાળો |
| [ ] | `qShortNeutral` | neutral | સામાન્ય |
| [ ] | `yourDay` | Your day | તમારો દિવસ |
| [ ] | `noon` | Noon | બપોર |
| [ ] | `seeAllPeriods` | See all periods, day and night → | દિવસ અને રાતના બધા સમય જુઓ → |
| [ ] | `paksha` | Paksha | પક્ષ |
| [ ] | `pakshaShukla` | Sud (waxing) | સુદ (અજવાળિયું) |
| [ ] | `pakshaKrishna` | Vad (waning) | વદ (અંધારિયું) |
| [ ] | `pakshaDay` | Day {n} of 15 | ૧૫માંથી {n}મો દિવસ |
| [ ] | `daysCount` | {n} days | {n} દિવસ |
| [ ] | `moonAria` | Moon, {pct}% lit, {phase} | ચંદ્ર, {pct}% પ્રકાશિત, {phase} |
| [ ] | `waxing` | waxing | વધતો |
| [ ] | `waning` | waning | ઘટતો |
| [ ] | `thisMonth` | This month | આ મહિને |
| [ ] | `punam` | Punam | પૂનમ |
| [ ] | `amas` | Amas | અમાસ |
| [ ] | `keyPunam` | Punam (full moon) | પૂનમ |
| [ ] | `keyAmas` | Amas (new moon) | અમાસ |
| [ ] | `noFestivalsMonth` | No festivals this month. | આ મહિને કોઈ તહેવાર નથી. |
| [ ] | `add` | Add | ઉમેરો |
| [ ] | `next` | Next | હવે પછી |
| [ ] | `thisYear` | This year | આ વર્ષે |
| [ ] | `pitruShraddh` | Pitru Paksha shraddh | પિતૃ પક્ષ શ્રાદ્ધ |
| [ ] | `reminder` | Reminder | યાદ |
| [ ] | `reminderBoth` | On the day and 1 day before, {time} | તે દિવસે અને ૧ દિવસ પહેલાં, {time} |
| [ ] | `reminderDay` | On the day, {time} | તે દિવસે, {time} |
| [ ] | `reminderBefore` | 1 day before, {time} | ૧ દિવસ પહેલાં, {time} |
| [ ] | `reminderNone` | No reminder | યાદ નથી |
| [ ] | `later` | Later | પછી |
| [ ] | `familyKeeps` | How your family keeps dates | તમારો પરિવાર તારીખો કેવી રીતે પાળે છે |
| [ ] | `familyKeepsSummary` | Varsi: {varsi}. Birthdays: {birthday}. When a tithi spans two days: {vriddhi}. | વરસી: {varsi}. જન્મદિવસ: {birthday}. તિથિ બે દિવસ હોય ત્યારે: {vriddhi}. |
| [ ] | `change` | Change | બદલો |
| [ ] | `previewTithi` | Aaso Sud 11 | આસો સુદ ૧૧ |
| [ ] | `paletteKagaz` | Kagaz | કાગળ |
| [ ] | `paletteUtsav` | Utsav | ઉત્સવ |

### Months (Gujarati year order) (12)

| OK | Key | English | ગુજરાતી (draft) |
|---|---|---|---|
| [ ] | `month.Kartika` | Kartak | કારતક |
| [ ] | `month.Margashirsha` | Magshar | માગશર |
| [ ] | `month.Pausha` | Posh | પોષ |
| [ ] | `month.Magha` | Maha | મહા |
| [ ] | `month.Phalguna` | Fagan | ફાગણ |
| [ ] | `month.Chaitra` | Chaitra | ચૈત્ર |
| [ ] | `month.Vaishakha` | Vaishakh | વૈશાખ |
| [ ] | `month.Jyeshtha` | Jeth | જેઠ |
| [ ] | `month.Ashadha` | Ashadh | અષાઢ |
| [ ] | `month.Shravana` | Shravan | શ્રાવણ |
| [ ] | `month.Bhadrapada` | Bhadarvo | ભાદરવો |
| [ ] | `month.Ashvin` | Aaso | આસો |

### Tithis (30)

| OK | Key | English | ગુજરાતી (draft) |
|---|---|---|---|
| [ ] | `tithi.1` | Sud 1 | સુદ ૧ |
| [ ] | `tithi.2` | Sud 2 | સુદ ૨ |
| [ ] | `tithi.3` | Sud 3 | સુદ ૩ |
| [ ] | `tithi.4` | Sud 4 | સુદ ૪ |
| [ ] | `tithi.5` | Sud 5 | સુદ ૫ |
| [ ] | `tithi.6` | Sud 6 | સુદ ૬ |
| [ ] | `tithi.7` | Sud 7 | સુદ ૭ |
| [ ] | `tithi.8` | Sud 8 | સુદ ૮ |
| [ ] | `tithi.9` | Sud 9 | સુદ ૯ |
| [ ] | `tithi.10` | Sud 10 | સુદ ૧૦ |
| [ ] | `tithi.11` | Sud 11 | સુદ ૧૧ |
| [ ] | `tithi.12` | Sud 12 | સુદ ૧૨ |
| [ ] | `tithi.13` | Sud 13 | સુદ ૧૩ |
| [ ] | `tithi.14` | Sud 14 | સુદ ૧૪ |
| [ ] | `tithi.15` | Sud Punam | સુદ પૂનમ |
| [ ] | `tithi.16` | Vad 1 | વદ ૧ |
| [ ] | `tithi.17` | Vad 2 | વદ ૨ |
| [ ] | `tithi.18` | Vad 3 | વદ ૩ |
| [ ] | `tithi.19` | Vad 4 | વદ ૪ |
| [ ] | `tithi.20` | Vad 5 | વદ ૫ |
| [ ] | `tithi.21` | Vad 6 | વદ ૬ |
| [ ] | `tithi.22` | Vad 7 | વદ ૭ |
| [ ] | `tithi.23` | Vad 8 | વદ ૮ |
| [ ] | `tithi.24` | Vad 9 | વદ ૯ |
| [ ] | `tithi.25` | Vad 10 | વદ ૧૦ |
| [ ] | `tithi.26` | Vad 11 | વદ ૧૧ |
| [ ] | `tithi.27` | Vad 12 | વદ ૧૨ |
| [ ] | `tithi.28` | Vad 13 | વદ ૧૩ |
| [ ] | `tithi.29` | Vad 14 | વદ ૧૪ |
| [ ] | `tithi.30` | Vad Amas | વદ અમાસ |

### Nakshatras (27)

| OK | Key | English | ગુજરાતી (draft) |
|---|---|---|---|
| [ ] | `nakshatra.1` | Ashwini | અશ્વિની |
| [ ] | `nakshatra.2` | Bharani | ભરણી |
| [ ] | `nakshatra.3` | Krittika | કૃત્તિકા |
| [ ] | `nakshatra.4` | Rohini | રોહિણી |
| [ ] | `nakshatra.5` | Mrigashira | મૃગશીર્ષ |
| [ ] | `nakshatra.6` | Ardra | આર્દ્રા |
| [ ] | `nakshatra.7` | Punarvasu | પુનર્વસુ |
| [ ] | `nakshatra.8` | Pushya | પુષ્ય |
| [ ] | `nakshatra.9` | Ashlesha | આશ્લેષા |
| [ ] | `nakshatra.10` | Magha | મઘા |
| [ ] | `nakshatra.11` | Purva Phalguni | પૂર્વા ફાલ્ગુની |
| [ ] | `nakshatra.12` | Uttara Phalguni | ઉત્તરા ફાલ્ગુની |
| [ ] | `nakshatra.13` | Hasta | હસ્ત |
| [ ] | `nakshatra.14` | Chitra | ચિત્રા |
| [ ] | `nakshatra.15` | Swati | સ્વાતિ |
| [ ] | `nakshatra.16` | Vishakha | વિશાખા |
| [ ] | `nakshatra.17` | Anuradha | અનુરાધા |
| [ ] | `nakshatra.18` | Jyeshtha | જ્યેષ્ઠા |
| [ ] | `nakshatra.19` | Mula | મૂળ |
| [ ] | `nakshatra.20` | Purva Ashadha | પૂર્વાષાઢા |
| [ ] | `nakshatra.21` | Uttara Ashadha | ઉત્તરાષાઢા |
| [ ] | `nakshatra.22` | Shravana | શ્રવણ |
| [ ] | `nakshatra.23` | Dhanishta | ધનિષ્ઠા |
| [ ] | `nakshatra.24` | Shatabhisha | શતભિષા |
| [ ] | `nakshatra.25` | Purva Bhadrapada | પૂર્વા ભાદ્રપદ |
| [ ] | `nakshatra.26` | Uttara Bhadrapada | ઉત્તરા ભાદ્રપદ |
| [ ] | `nakshatra.27` | Revati | રેવતી |

### Yogas (27)

| OK | Key | English | ગુજરાતી (draft) |
|---|---|---|---|
| [ ] | `yoga.1` | Vishkambha | વિષ્કંભ |
| [ ] | `yoga.2` | Priti | પ્રીતિ |
| [ ] | `yoga.3` | Ayushman | આયુષ્માન |
| [ ] | `yoga.4` | Saubhagya | સૌભાગ્ય |
| [ ] | `yoga.5` | Shobhana | શોભન |
| [ ] | `yoga.6` | Atiganda | અતિગંડ |
| [ ] | `yoga.7` | Sukarma | સુકર્મા |
| [ ] | `yoga.8` | Dhriti | ધૃતિ |
| [ ] | `yoga.9` | Shula | શૂળ |
| [ ] | `yoga.10` | Ganda | ગંડ |
| [ ] | `yoga.11` | Vriddhi | વૃદ્ધિ |
| [ ] | `yoga.12` | Dhruva | ધ્રુવ |
| [ ] | `yoga.13` | Vyaghata | વ્યાઘાત |
| [ ] | `yoga.14` | Harshana | હર્ષણ |
| [ ] | `yoga.15` | Vajra | વજ્ર |
| [ ] | `yoga.16` | Siddhi | સિદ્ધિ |
| [ ] | `yoga.17` | Vyatipata | વ્યતિપાત |
| [ ] | `yoga.18` | Variyan | વરીયાન |
| [ ] | `yoga.19` | Parigha | પરિઘ |
| [ ] | `yoga.20` | Shiva | શિવ |
| [ ] | `yoga.21` | Siddha | સિદ્ધ |
| [ ] | `yoga.22` | Sadhya | સાધ્ય |
| [ ] | `yoga.23` | Shubha | શુભ |
| [ ] | `yoga.24` | Shukla | શુક્લ |
| [ ] | `yoga.25` | Brahma | બ્રહ્મ |
| [ ] | `yoga.26` | Indra | ઇન્દ્ર |
| [ ] | `yoga.27` | Vaidhriti | વૈધૃતિ |

### Karanas (11)

| OK | Key | English | ગુજરાતી (draft) |
|---|---|---|---|
| [ ] | `karana.Bava` | Bava | બવ |
| [ ] | `karana.Balava` | Balava | બાલવ |
| [ ] | `karana.Kaulava` | Kaulava | કૌલવ |
| [ ] | `karana.Taitila` | Taitila | તૈતિલ |
| [ ] | `karana.Garaja` | Garaja | ગર |
| [ ] | `karana.Vanija` | Vanija | વણિજ |
| [ ] | `karana.Vishti` | Vishti | વિષ્ટિ |
| [ ] | `karana.Kimstughna` | Kimstughna | કિંસ્તુઘ્ન |
| [ ] | `karana.Shakuni` | Shakuni | શકુનિ |
| [ ] | `karana.Chatushpada` | Chatushpada | ચતુષ્પાદ |
| [ ] | `karana.Naga` | Naga | નાગ |

### Choghadiya (7)

| OK | Key | English | ગુજરાતી (draft) |
|---|---|---|---|
| [ ] | `choghadiya.Amrut` | Amrut | અમૃત |
| [ ] | `choghadiya.Shubh` | Shubh | શુભ |
| [ ] | `choghadiya.Labh` | Labh | લાભ |
| [ ] | `choghadiya.Char` | Char | ચલ |
| [ ] | `choghadiya.Udveg` | Udveg | ઉદ્વેગ |
| [ ] | `choghadiya.Kaal` | Kaal | કાળ |
| [ ] | `choghadiya.Rog` | Rog | રોગ |

### Weekdays (7)

| OK | Key | English | ગુજરાતી (draft) |
|---|---|---|---|
| [ ] | `vara.0` | Sunday | રવિવાર |
| [ ] | `vara.1` | Monday | સોમવાર |
| [ ] | `vara.2` | Tuesday | મંગળવાર |
| [ ] | `vara.3` | Wednesday | બુધવાર |
| [ ] | `vara.4` | Thursday | ગુરુવાર |
| [ ] | `vara.5` | Friday | શુક્રવાર |
| [ ] | `vara.6` | Saturday | શનિવાર |

### Festivals (14)

| OK | Key | English | ગુજરાતી (draft) |
|---|---|---|---|
| [ ] | `festival.maha-shivaratri` | Maha Shivaratri | મહા શિવરાત્રી |
| [ ] | `festival.holika-dahan` | Holika Dahan | હોલિકા દહન |
| [ ] | `festival.dhuleti` | Dhuleti | ધૂળેટી |
| [ ] | `festival.raksha-bandhan` | Raksha Bandhan | રક્ષાબંધન |
| [ ] | `festival.janmashtami-smarta` | Janmashtami (Smarta) | જન્માષ્ટમી (સ્માર્ત) |
| [ ] | `festival.janmashtami-vaishnava` | Janmashtami (Vaishnava) | જન્માષ્ટમી (વૈષ્ણવ) |
| [ ] | `festival.navratri` | Navratri | નવરાત્રી |
| [ ] | `festival.dussehra` | Dussehra | દશેરા |
| [ ] | `festival.dhanteras` | Dhanteras | ધનતેરસ |
| [ ] | `festival.kali-chaudas` | Kali Chaudas | કાળી ચૌદસ |
| [ ] | `festival.diwali` | Diwali | દિવાળી |
| [ ] | `festival.bestu-varas` | Bestu Varas | બેસતું વર્ષ |
| [ ] | `festival.bhai-bij` | Bhai Bij | ભાઈ બીજ |
| [ ] | `festival.uttarayan` | Uttarayan | ઉત્તરાયણ |

### Festival short names (Month grid cells) (14)

| OK | Key | English | ગુજરાતી (draft) |
|---|---|---|---|
| [ ] | `festivalShort.maha-shivaratri` | Shivrat | શિવરાત |
| [ ] | `festivalShort.holika-dahan` | Holi | હોળી |
| [ ] | `festivalShort.dhuleti` | Dhuleti | ધૂળેટી |
| [ ] | `festivalShort.raksha-bandhan` | Rakhi | રાખી |
| [ ] | `festivalShort.janmashtami-smarta` | Krishna | કૃષ્ણ |
| [ ] | `festivalShort.janmashtami-vaishnava` | Krishna | કૃષ્ણ |
| [ ] | `festivalShort.navratri` | Norta | નોરતાં |
| [ ] | `festivalShort.dussehra` | Dasara | દશેરા |
| [ ] | `festivalShort.dhanteras` | Dhan | ધનતેરસ |
| [ ] | `festivalShort.kali-chaudas` | Kali | કાળી ચૌદસ |
| [ ] | `festivalShort.diwali` | Diwali | દિવાળી |
| [ ] | `festivalShort.bestu-varas` | Bestu | બેસતું વર્ષ |
| [ ] | `festivalShort.bhai-bij` | Bhaibij | ભાઈ બીજ |
| [ ] | `festivalShort.uttarayan` | Utran | ઉતરાણ |
