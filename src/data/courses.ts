// Canonical course registry for the /teaching course filters.
//
// This is the single source of truth for the clickable course tags/filters.
// Each video's `category` (see youtubeVideos.ts) is mapped here to a course
// identity (id + short tag + full title). To add a future course (Physics 1,
// Quantum Computing, Complex Analysis, ODE, …) just add a row here and classify
// videos into its `categories` — the teaching page renders a filter chip only
// for courses that actually have content, so listing a future course early is
// harmless.
//
// `categories` are the coarse VideoCategory values that belong to the course.
// Keep `id` STABLE — it is used as the data-course value in the UI and as the
// courseId stamped onto videos and tirgulim.

export interface TeachingCourse {
  id: string; // stable slug — data-course value, and courseId on videos/tirgulim
  tag: string; // short clickable label, e.g. "Hedva 2"
  title: string; // full title, e.g. "Hedva 2 / Calculus 2"
  categories: string[]; // YouTubeVideo.category values that belong to this course
}

export const teachingCourses: TeachingCourse[] = [
  {
    id: "hedva2",
    tag: "Hedva 2",
    title: "Hedva 2 / Calculus 2",
    categories: ["hedva2"],
  },
  {
    id: "linear-algebra",
    tag: "Linear Algebra",
    title: "Linear Algebra",
    categories: ["linear_algebra"],
  },
  {
    id: "group-theory",
    tag: "Group Theory",
    title: "Group Theory",
    categories: ["group_theory"],
  },
  // ── Future courses (no content yet → no filter chip until classified). ──
  // Uncomment / extend as recordings for these are added & classified.
  // { id: "quantum-computing", tag: "Quantum Computing", title: "Quantum Computing", categories: ["quantum"] },
  // { id: "physics-1",         tag: "Physics 1",         title: "Physics 1",         categories: ["physics"] },
  // { id: "physics-2",         tag: "Physics 2",         title: "Physics 2",         categories: ["physics"] },
  // { id: "complex-analysis",  tag: "Complex Analysis",  title: "Complex Analysis",  categories: ["complex_analysis"] },
  // { id: "ode",               tag: "ODE",               title: "Ordinary Differential Equations", categories: ["ode"] },
];

// Neutral fallback for any category that isn't claimed by a course above
// (e.g. "unknown", "other", "project"). Never invents a course name.
const FALLBACK = { courseId: "unknown", courseTag: "Needs classification" };

// Map a coarse video category to its course identity (id + tag).
// Used to stamp courseId/courseTag onto each video at export time.
export function courseFor(category: string): {
  courseId: string;
  courseTag: string;
} {
  const course = teachingCourses.find((c) => c.categories.includes(category));
  return course
    ? { courseId: course.id, courseTag: course.tag }
    : FALLBACK;
}
