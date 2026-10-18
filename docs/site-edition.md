# October 2026 site edition

The academic profile leads with the M.Sc. in Physics thesis supervised by Prof.
Yaron Oz. Thesis-topic descriptions are intentionally absent from the profile,
research page, homepage, and metadata. Standalone public projects remain available.

The `/cv` route displays an unavailable notice with `noindex, nofollow`. The PDF
is removed from `public/files/cv/`, and the built deployment must not contain it.
This removes access through the current site; it does not purge earlier GitHub
commits, third-party copies, or caches.

Three upcoming entries were recovered from the owner's earlier planning:
- QTC Community Meetup, 28 October 2026: save the date.
- QuanTAU Journal Club opening, 28 October 2026: planned; format, time, speaker,
  and venue require confirmation.
- Quantum Day, 12 November 2026: save the date.

`announcementStatus` distinguishes confirmed events, save-the-date notices, and
planned sessions. `src/data/eventStatus.ts` classifies dates in Israel time when
the static site is built. Rebuild after an event date to refresh published lists.
No recurring dates or unconfirmed speakers are presented as confirmed.

`src/data/reading.ts` holds a dated, manually curated October selection with
publisher URLs, dates, and original recommendation notes. New editions require
source verification. Student resources distinguish introductory study from
optional enrichment.

The English syllabus at `/teaching/linear-algebra-electrical/syllabus` renders
the supplied Semester A 2026–2027 syllabus for course 05091724. It includes the
12 topic blocks, assessment eligibility rules, exam format, and bibliography.
The print control uses the browser's native print/save-to-PDF facility.

Verify with the locked pnpm dependencies and `pnpm run build`, followed by
`scripts/tests/site-release.mjs` and `scripts/tests/portal-dom.mjs` using
`PORTAL_QA_ROOT` for the separately installed jsdom runtime. The checks do not
replace a graphical browser review. Class codes and account passwords must not
be added to source files or the published site.
