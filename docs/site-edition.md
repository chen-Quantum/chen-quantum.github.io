# October 2026 site edition

The academic profile leads with the M.Sc. in Physics thesis supervised by Prof.
Yaron Oz. Thesis-topic descriptions are intentionally absent from the profile,
research page, homepage, and metadata. Standalone public projects remain available.

The `/cv` route is a readable web CV and is linked from the navigation. The PDF
remains removed from `public/files/cv/`, and the built deployment must not contain
it or any download/embed links to it. This does not purge earlier GitHub commits,
third-party copies, or caches.

Three upcoming entries were recovered from the owner's earlier planning:

- QTC Community Meetup, 28 October 2026: save the date.
- QuanTAU Journal Club opening, 28 October 2026: planned; format, time, speaker,
  and venue require confirmation.
- Quantum Day, 12 November 2026: save the date.

`announcementStatus` distinguishes confirmed events, save-the-date notices, and
planned sessions. `src/data/eventStatus.ts` classifies dates in Israel time when
the static site is built. Rebuild after an event date to refresh published lists.
No recurring dates or unconfirmed speakers are presented as confirmed.

`src/data/reading.ts` holds a dated, manually curated selection from 18 September
to 18 October, with publisher URLs, publication dates, and original recommendation
notes. The selection covers Quanta Magazine, IEEE Spectrum, Nature, Science News,
and APS Physics; cards show the actual publisher. Topic filters distinguish
quantum/physics from machine learning/AI. New editions require
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

Class access codes were simplified on the server at the owner’s request. Existing
memberships and private recovery access are preserved. Codes remain absent from
source files and the public site.
