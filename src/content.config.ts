import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const library = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/library" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    kind: z.enum(["recording", "practice", "tip", "short-video", "study-song"]),
    course: z.string().optional(),
    topic: z.string().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    embedUrl: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    // Optional card thumbnail (path under /public, e.g. "/media/qbrl/foo.png").
    // Public-safe imagery only.
    thumbnail: z.string().optional(),
    tech: z.array(z.string()).default([]),
    // A project links to a repo ONLY when that repo actually implements it.
    github: z.string().url().optional(),
    // Link text for the repo (e.g. "GitHub" for a full repo, "Preview repo"
    // for a public teaser of a private prototype). Defaults to "GitHub".
    repoLabel: z.string().optional(),
    // Shown when there is no public repo yet (e.g. "code release pending").
    repoNote: z.string().optional(),
    live: z.string().url().optional(),
    // Optional extra document links rendered as small buttons (e.g. PDFs).
    docs: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
    // Short status badge: e.g. "Research prototype", "Public preview".
    status: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const research = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/research" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    area: z.string().optional(),
    coauthors: z.array(z.string()).default([]),
    venue: z.string().optional(),
    arxiv: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

const updates = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/updates" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

const courses = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/courses" }),
  schema: z.object({
    title: z.string(),
    shortDescription: z.string(),
    semester: z.string(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    youtubeLinks: z
      .array(
        z.object({
          title: z.string(),
          url: z.string().url(),
        })
      )
      .default([]),
    tutorials: z
      .array(
        z.object({
          title: z.string(),
          url: z.string().url(),
          type: z.string().default("tutorial"),
        })
      )
      .default([]),
    assignments: z
      .array(
        z.object({
          title: z.string(),
          url: z.string().url().optional(),
          dueDate: z.string().optional(),
        })
      )
      .default([]),
    resources: z
      .array(
        z.object({
          title: z.string(),
          url: z.string().url(),
        })
      )
      .default([]),
    draft: z.boolean().default(false),
  }),
});

// Tutorial/practice materials — PDFs presented with deterrence viewer.
// NOTE: deterrence only, not perfect protection. See docs.
const materials = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/materials" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    subject: z.string(),
    // Path relative to /public/materials/, e.g. "dirac-notation.pdf"
    pdfFile: z.string().optional(),
    // Or a full URL if hosted elsewhere
    pdfUrl: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
    course: z.string().optional(),
    type: z
      .enum(["tutorial", "practice", "worksheet", "notes", "exam-prep"])
      .default("tutorial"),
    featured: z.boolean().default(false),
    passwordProtected: z.boolean().default(false),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

// Quantum community events.
// This collection is the project's existing convention for events (it powers
// /quantum-community/events/*, the homepage, and the community page). It has been
// extended with poster/talks/partners/time fields so the QTC archive can present
// the real poster information faithfully.
//
// IMPORTANT (accuracy rules baked into the data):
//  - `talks` carries each speaker exactly as printed on the poster, with optional
//    role + talk title. The site never claims the site owner spoke or organised.
//  - When a poster does NOT print a year, set `dateConfirmed: false` and put the
//    exact printed date in `dateDisplay` (e.g. "18.11", "12 Nov", "May 27").
//    `date` is then a sort-only placeholder and the year is NEVER displayed.
const communityEvents = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/communityEvents",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    // Exact date string as printed on the poster. Always shown when present.
    dateDisplay: z.string().optional(),
    // false => the poster did not print a year; `date` is sort-only, year hidden.
    dateConfirmed: z.boolean().default(true),
    // Time as printed on the poster, e.g. "18:00", "17:00–19:00", "9am–5pm".
    time: z.string().optional(),
    eventType: z
      .enum([
        "conference",
        "workshop",
        "lecture",
        "meetup",
        "community-event",
        "symposium",
        "hackathon",
      ])
      .default("meetup"),
    venue: z.string().optional(),
    collaborators: z.array(z.string()).default([]),
    speakers: z.array(z.string()).default([]),
    // Rich speaker info from the poster: name (+ optional role / talk title).
    talks: z
      .array(
        z.object({
          speaker: z.string(),
          role: z.string().optional(),
          talk: z.string().optional(),
        })
      )
      .default([]),
    // Partner / sponsor logos shown on the poster (names only).
    partners: z.array(z.string()).default([]),
    // Poster image path relative to /public/community/, e.g. "qtc/<id>.jpg".
    posterImage: z.string().optional(),
    registrationUrl: z.string().url().optional(),
    // Paths relative to /public/community/
    photos: z.array(z.string()).default([]),
    // Short editorial note (e.g. an unresolved detail). Shown subtly.
    notes: z.string().optional(),
    featured: z.boolean().default(false),
    status: z.enum(["upcoming", "past"]).default("upcoming"),
    draft: z.boolean().default(false),
  }),
});

// Quantum community gallery groupings
const communityGallery = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/communityGallery",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    eventDate: z.coerce.date(),
    // Paths relative to /public/community/gallery/
    photos: z.array(
      z.object({
        file: z.string(),
        caption: z.string().optional(),
      })
    ).default([]),
    coverPhoto: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const teaching = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/teaching" }),
  schema: z.object({
    title: z.string(),
    titleHebrew: z.string().optional(),
    description: z.string(),
    courseId: z.string(),
    audience: z.array(z.string()).default([]),
    topics: z.array(z.string()).default([]),
    semester: z.string().optional(),
    institution: z.string().optional(),
    status: z.enum(["active", "upcoming", "past"]).default("active"),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  library,
  projects,
  research,
  updates,
  courses,
  materials,
  communityEvents,
  communityGallery,
  teaching,
};
