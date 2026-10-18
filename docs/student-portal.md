# Student Hub

The public site stays on GitHub Pages. `/students` provides an English interface for
class discussions and private conversations. `/contact` routes all inquiries
into this system. Messages and replies stay on the site; no outgoing email is sent.
The course logistics form collects an email address privately for identification.

The student and instructor interfaces are English only, including first load,
loading states, validation errors, course titles, and blocked-storage messages.
Previous browser language preferences do not change the interface language.

## Instructor workflow

1. Open `/students` and choose **Instructor sign in**.
2. Sign in with the existing teaching-workspace account. No new password was
   created or assigned to the owner by this change.
3. The dashboard shows open questions, active private requests, and the three
   class access codes. Share each code in the appropriate class.
4. Select a class. Official replies identify Chen; peer replies stay anonymous.
   The instructor can pin, hide, close, or reopen discussions and hide replies.
5. Under Student requests, review the selected course and submitted contact email
   for logistics requests, reply privately on the site, and update the request status.
   A student's follow-up reopens a resolved request.

The current owner account is registered server-side in `student_portal_staff`.
Other staff in the separate teaching workspace do not automatically receive
access to these private conversations.

## Student workflow

- Choose the correct class and enter its code. This is a classroom access gate,
  not independent verification of enrollment.
- Post course questions or anonymous peer replies. Only instructor replies are
  marked official. Students can add an “I have this question too” vote once.
- Use **Write a logistics request** (or `/students?mode=logistics`) for course
  logistics. Select one of the three courses and provide a valid email address.
  Both are required in the browser and API; the database also enforces contact
  details on newly identified logistics requests. A name is optional.
- Other private requests for material or personal matters remain available
  through the classroom. Anonymous Q&A does not collect email.
- **My private requests** (`/students?mode=requests`) lists the sender’s private
  conversations across courses. Logistics requires no classroom code and does
  not grant access to class discussions. The private recovery code remains the
  access key; the submitted email does not authenticate ownership.
- Read replies on the website. No outgoing email notification is sent.
- Save the private recovery code. Browser storage preserves access on this
  device. The recovery code restores the same conversations on another device.
  Anyone who holds the code can access the student's private requests. Losing
  both the browser data and the code loses access.
- General inquiries can start private conversations without a classroom code.

## Implementation and access model

- Uses the existing `teaching-workspace` project
  `ccrthybyqhbnrclxomls`; does not create a paid project or change its plan.
- The browser includes only the publishable key. The Edge Function obtains its
  service credentials from built-in runtime secrets.
- `/functions/v1/student-portal` performs its own authentication. Platform JWT
  verification is disabled so students do not need email accounts. Staff routes
  validate a Supabase access token using Auth and then check the server-side
  staff allowlist. Classroom codes are returned only by the authorized staff
  dashboard route.
- Students use random 256-bit capability keys. Only SHA-256 digests are stored
  in the database. Student routes check classroom membership and private-ticket
  ownership. Actor digests and capability keys never appear in forum responses.
- All nine `student_portal_*` tables enable RLS, explicitly deny browser roles,
  and revoke table access from `anon` and `authenticated`. Database access goes
  through the API only. The rate-limit RPC is executable by `service_role` only.
- Public text is rendered as escaped text, never trusted HTML. The API validates
  input length, categories, UUIDs, request size, class scope, and moderation
  privileges. Per-IP and per-visitor limits constrain submissions and class-code
  guessing. Browser origins are restricted to the existing site and local QA.
- The existing teaching dashboard tables and its user permissions are unchanged.

`supabase/student-portal.sql` records the complete schema, including the explicit
deny policies added in the follow-up migration. The live migration history has
`add_student_communication_portal` and
`explicitly_deny_direct_student_portal_access`, and
`add_private_logistics_contact_details`. Existing requests remain readable with
nullable contact details. New logistics requests are marked separately.

`my_tickets` always filters by the hashed visitor capability. `ticket_message`
checks both that hash and the matching course/ticket pair before writing a
student follow-up; staff access still requires verified Auth plus the allowlist.

The Supabase security advisor found no table/RLS issues in this change. It also
reported the existing disabled [leaked-password protection setting](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
No authentication plan or billing changes were made.

To deploy API changes, deploy `supabase/functions/student-portal/index.ts` as
`student-portal` in the teaching project. Keep its own authentication checks and
`verify_jwt=false`. The static site deploys through the repository's existing
GitHub Pages workflow when `main` changes.

## Verification

- Use the repository's `pnpm-lock.yaml` and `pnpm install --frozen-lockfile`.
  Run `pnpm run build`. The original dependency ranges can otherwise resolve
  incompatible newer packages when installed without the lockfile.
- `scripts/tests/portal-live.py` verifies the real student/instructor APIs with
  temporary test records and a temporary instructor account. It accepts those
  temporary credentials through stdin and does not send email. Remove all
  records for the reported actor digests and remove the temporary auth user
  after the test. Never run it with a real student's recovery code.
- `scripts/tests/portal-dom.mjs` verifies the interface in a DOM test runtime,
  using mocked API responses. This is not a graphical browser/layout test.

The instructor's login credentials are deliberately absent from this repository.
Class codes are generated in the database and are not checked into source.

The offline `scripts/tests/portal-api.mjs` runs the actual Edge Function with an
in-memory REST boundary, including contact validation, cross-user isolation,
private replies without classroom membership, and anonymous-board privacy. It
creates no production records. The DOM suite covers the logistics and inbox
links, required fields, selected course, and private email display.
