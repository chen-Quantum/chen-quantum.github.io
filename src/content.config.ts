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
    tech: z.array(z.string()).default([]),
    github: z.string().url().optional(),
    live: z.string().url().optional(),
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

// Quantum community events
const communityEvents = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/communityEvents",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    eventType: z
      .enum([
        "conference",
        "workshop",
        "lecture",
        "meetup",
        "community-event",
        "symposium",
      ])
      .default("meetup"),
    venue: z.string().optional(),
    collaborators: z.array(z.string()).default([]),
    speakers: z.array(z.string()).default([]),
    registrationUrl: z.string().url().optional(),
    // Paths relative to /public/community/
    photos: z.array(z.string()).default([]),
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
